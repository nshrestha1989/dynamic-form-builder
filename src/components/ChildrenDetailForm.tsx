import { useEffect, useState } from 'react'
import { Child, FormErrors } from '../types/formTypes'
import DynamicFormRenderer from './DynamicFormRenderer'
import { childrenSectionConfig } from '../config/formConfig'
interface TravelAddressesFormProps {
  children: Child[]
  onChange: (updatedAddresses: Child[]) => void
  formErrors: FormErrors
  setFormErrors: React.Dispatch<React.SetStateAction<FormErrors>>
}

const ChildrenDetailForm: React.FC<TravelAddressesFormProps> = ({
  children,
  onChange,
  formErrors,
  setFormErrors
}) => {
  const [localAlertDialog, setLocalAlertDialog] = useState({
    show: false,
    title: '',
    description: ''
  })

  const validateSingleChild = (address: Child): { [key: string]: string } => {
    const errors: { [key: string]: string } = {}

    childrenSectionConfig.fields.forEach((fieldConfig) => {
      // Use the fields from the section config
      const fieldId = fieldConfig.id as keyof Child
      const value = address[fieldId]

      const isRequired =
        typeof fieldConfig.required === 'function'
          ? fieldConfig.required(address) // Pass the current address for conditional required
          : fieldConfig.required

      if (
        isRequired &&
        (value === null || value === '' || value === undefined)
      ) {
        errors[fieldId] = `${fieldConfig.label} is required`
      }
    })
    return errors
  }
  useEffect(() => {
    if (children.length === 0) {
      addChild()
    }
  }, [])
  const addChild = () => {
    // Validate the last address if it exists
    if (children.length > 0) {
      const lastChild = children[children.length - 1]
      const lastChildError = validateSingleChild(lastChild)

      if (Object.keys(lastChildError).length > 0) {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          addresses: {
            ...((prevErrors.addresses || {}) as {
              [key: number]: { [key: string]: string }
            }),
            [children.length - 1]: lastChildError
          }
        }))
        setLocalAlertDialog({
          show: true,
          title: 'Validation Error',
          description:
            'Please complete the current child details before adding a new one.'
        })
        return
      }
    }

    const newChild: Child = {
      name: '',
      age: ''
    }
    onChange([...children, newChild])
    setLocalAlertDialog({ show: false, title: '', description: '' })
  }

  const removeChild = (indexToRemove: number) => {
    // Remove an address at a specific index
    onChange(children.filter((_, index) => index !== indexToRemove))
    // Also remove any related errors for this address
    setFormErrors((prevErrors) => {
      const newErrors = { ...prevErrors }
      if (newErrors.children) {
        const currentChildErrors = newErrors.children as {
          [key: number]: { [key: string]: string }
        }
        delete currentChildErrors[indexToRemove]
        // Re-index subsequent errors if any
        const reIndexedErrors: { [key: number]: { [key: string]: string } } = {}
        Object.keys(currentChildErrors).forEach((key) => {
          const numKey = Number(key)
          if (numKey > indexToRemove) {
            reIndexedErrors[numKey - 1] = currentChildErrors[numKey]
          } else {
            reIndexedErrors[numKey] = currentChildErrors[numKey]
          }
        })
        if (Object.keys(reIndexedErrors).length > 0) {
          newErrors.addresses = reIndexedErrors
        } else {
          delete newErrors.addresses
        }
      }
      return newErrors
    })
  }

  const onChildFormChange = (index: number) => (updatedAddress: Child) => {
    // Update the specific address in the addresses array
    const newChildren = children.map((addr, i) =>
      i === index ? updatedAddress : addr
    )
    onChange(newChildren)

    // Re-validate and update errors for this specific address
    const currentChildrenErrors = validateSingleChild(updatedAddress)
    setFormErrors((prevErrors) => {
      const newErrors = { ...prevErrors }
      let updatedChildErrors = (newErrors.addresses || {}) as {
        [key: number]: { [key: string]: string }
      }

      if (Object.keys(currentChildrenErrors).length > 0) {
        updatedChildErrors = {
          ...updatedChildErrors,
          [index]: currentChildrenErrors
        }
      } else {
        delete updatedChildErrors[index]
        if (Object.keys(updatedChildErrors).length === 0) {
          delete newErrors.addresses
        }
      }
      newErrors.addresses = updatedChildErrors
      return newErrors
    })
  }

  return (
    <div className="border p-4 rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Children Details</h3>
      {children.map((address: Child, index: number) => (
        <div
          key={index}
          className="mb-4 p-3 border rounded-md bg-white shadow-sm relative"
        >
          <h4 className="font-medium mb-2">Address {index + 1}</h4>
          {children.length > 0 && (
            <button
              type="button"
              onClick={() => removeChild(index)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs hover:bg-red-600"
            >
              &times;
            </button>
          )}
          {/* Now using DynamicFormRenderer for each address */}
          <DynamicFormRenderer<Child>
            configKey="childrenDetails" // Use a consistent key for the address config
            formData={address}
            errors={
              (formErrors.addresses &&
              typeof formErrors.addresses === 'object' &&
              (formErrors.addresses as any)[index]
                ? (formErrors.addresses as any)[index]
                : {}) as FormErrors
            } // Pass errors specific to this address
            onFormChange={onChildFormChange(index)} // Pass a handler for this specific address
            onErrorsChange={(setErrorsAction) => {
              // setErrorsAction can be a function or an object
              setFormErrors((prevErrors) => {
                if (typeof setErrorsAction === 'function') {
                  return setErrorsAction(prevErrors)
                }
                return setErrorsAction
              })
            }} // Pass a compatible error handler for this specific address
            formId={index} // Use index as formId for individual addresses
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addChild}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Add Children Details
      </button>

      {localAlertDialog.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="alert-dialog bg-white rounded-lg shadow-xl p-6 max-w-md w-full border border-orange-400">
            <h3 className="text-xl font-bold text-orange-700 mb-3">
              {localAlertDialog.title}
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {localAlertDialog.description}
            </p>
            <button
              onClick={() =>
                setLocalAlertDialog({ ...localAlertDialog, show: false })
              }
              className="mt-5 px-5 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition duration-300 ease-in-out"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
export default ChildrenDetailForm
