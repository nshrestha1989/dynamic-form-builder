import { useEffect, useState } from 'react'
import { FormErrors, TravelAddress } from '../types/formTypes'
import { travelAddressSectionConfig } from '../config/formConfig'
import DynamicFormRenderer from './DynamicFormRenderer'

// --- src/components/TravelAddressesForm.tsx ---
interface TravelAddressesFormProps {
  addresses: TravelAddress[]
  onChange: (updatedAddresses: TravelAddress[]) => void
  formErrors: FormErrors
  setFormErrors: React.Dispatch<React.SetStateAction<FormErrors>> // Passed down for specific address errors
}

const TravelAddressesForm: React.FC<TravelAddressesFormProps> = ({
  addresses,
  onChange,
  formErrors,
  setFormErrors
}) => {
  const [localAlertDialog, setLocalAlertDialog] = useState({
    show: false,
    title: '',
    description: ''
  })

  // Function to validate a single address object
  const validateSingleAddress = (
    address: TravelAddress
  ): { [key: string]: string } => {
    const errors: { [key: string]: string } = {}

    travelAddressSectionConfig.fields.forEach((fieldConfig) => {
      // Use the fields from the section config
      const fieldId = fieldConfig.id as keyof TravelAddress
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

    if (address.startDate && address.endDate) {
      const startDate = new Date(address.startDate)
      const endDate = new Date(address.endDate)
      if (startDate > endDate) {
        errors.endDate = 'End Date cannot be before Start Date'
      }
    }
    return errors
  }
  useEffect(() => {
    if (addresses.length === 0) {
      addAddress()
    }
  }, [])

  const addAddress = () => {
    // Validate the last address if it exists
    if (addresses.length > 0) {
      const lastAddress = addresses[addresses.length - 1]
      const lastAddressErrors = validateSingleAddress(lastAddress)

      if (Object.keys(lastAddressErrors).length > 0) {
        // Update the formErrors state with errors for the last address
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          addresses: {
            ...((prevErrors.addresses || {}) as {
              [key: number]: { [key: string]: string }
            }),
            [addresses.length - 1]: lastAddressErrors
          }
        }))
        setLocalAlertDialog({
          show: true,
          title: 'Validation Error',
          description:
            'Please complete the current address details before adding a new one.'
        })
        return // Prevent adding new address if current one is invalid
      }
    }

    // If no addresses or the last address is valid, add a new empty address object
    const newAddress: TravelAddress = {
      address: '',
      suburb: '',
      state: '',
      postcode: '',
      startDate: null,
      endDate: null
    }
    onChange([...addresses, newAddress])
    // Clear any local alert if it was showing
    setLocalAlertDialog({ show: false, title: '', description: '' })
  }

  const removeAddress = (indexToRemove: number) => {
    // Remove an address at a specific index
    onChange(addresses.filter((_, index) => index !== indexToRemove))
    // Also remove any related errors for this address
    setFormErrors((prevErrors) => {
      const newErrors = { ...prevErrors }
      if (newErrors.addresses) {
        const currentAddressErrors = newErrors.addresses as {
          [key: number]: { [key: string]: string }
        }
        delete currentAddressErrors[indexToRemove]
        // Re-index subsequent errors if any
        const reIndexedErrors: { [key: number]: { [key: string]: string } } = {}
        Object.keys(currentAddressErrors).forEach((key) => {
          const numKey = Number(key)
          if (numKey > indexToRemove) {
            reIndexedErrors[numKey - 1] = currentAddressErrors[numKey]
          } else {
            reIndexedErrors[numKey] = currentAddressErrors[numKey]
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

  // const handleAddressChange = (
  //   index: number,
  //   field: keyof TravelAddress,
  //   value: any
  // ) => {
  //   // Update a specific field in a specific address
  //   const updatedAddresses = addresses.map((addr, i) =>
  //     i === index ? { ...addr, [field]: value } : addr
  //   )
  //   onChange(updatedAddresses)

  //   // Re-validate the specific address and update errors in the parent state
  //   const currentAddressErrors = validateSingleAddress(updatedAddresses[index])
  //   setFormErrors((prevErrors) => {
  //     const newErrors = { ...prevErrors }
  //     let updatedAddressesErrors = (newErrors.addresses || {}) as {
  //       [key: number]: FormErrors | { [key: string]: string }
  //     }

  //     if (Object.keys(currentAddressErrors).length > 0) {
  //       updatedAddressesErrors = {
  //         ...updatedAddressesErrors,
  //         [index]: currentAddressErrors
  //       }
  //     } else {
  //       delete updatedAddressesErrors[index]
  //       if (Object.keys(updatedAddressesErrors).length === 0) {
  //         delete newErrors.addresses // Remove addresses key if no errors exist
  //       }
  //     }
  //     newErrors.addresses = updatedAddressesErrors
  //     return newErrors
  //   })

  //   // Close local alert if validation passes for the field that was causing it
  //   if (
  //     localAlertDialog.show &&
  //     Object.keys(currentAddressErrors).length === 0
  //   ) {
  //     setLocalAlertDialog({ show: false, title: '', description: '' })
  //   }
  // }

  // Callback to handle changes for an individual address when passed to DynamicFormRenderer
  const onAddressFormChange =
    (index: number) => (updatedAddress: TravelAddress) => {
      // Update the specific address in the addresses array
      const newAddresses = addresses.map((addr, i) =>
        i === index ? updatedAddress : addr
      )
      onChange(newAddresses)

      // Re-validate and update errors for this specific address
      const currentAddressErrors = validateSingleAddress(updatedAddress)
      setFormErrors((prevErrors) => {
        const newErrors = { ...prevErrors }
        let updatedAddressesErrors = (newErrors.addresses || {}) as {
          [key: number]: { [key: string]: string }
        }

        if (Object.keys(currentAddressErrors).length > 0) {
          updatedAddressesErrors = {
            ...updatedAddressesErrors,
            [index]: currentAddressErrors
          }
        } else {
          delete updatedAddressesErrors[index]
          if (Object.keys(updatedAddressesErrors).length === 0) {
            delete newErrors.addresses
          }
        }
        newErrors.addresses = updatedAddressesErrors
        return newErrors
      })
    }

  // Callback to handle errors for an individual address
  const onAddressErrorsChange =
    (index: number) => (errorsForAddress: FormErrors) => {
      setFormErrors((prevErrors) => {
        const newErrors = { ...prevErrors }
        let currentAddressesErrors = (newErrors.addresses || {}) as {
          [key: number]: { [key: string]: string }
        }
        const flatErrors: { [key: string]: string } = {}
        for (const key in errorsForAddress) {
          const value = errorsForAddress[key]
          if (typeof value === 'string') {
            flatErrors[key] = value
          }
        }

        if (Object.keys(errorsForAddress).length > 0) {
          currentAddressesErrors = {
            ...currentAddressesErrors,
            [index]: flatErrors
          }
        } else {
          delete currentAddressesErrors[index]
          if (Object.keys(currentAddressesErrors).length === 0) {
            delete newErrors.addresses
          }
        }
        newErrors.addresses = currentAddressesErrors
        return newErrors
      })
    }

  return (
    <div className="border p-4 rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Travel Addresses</h3>
      {addresses.map((address: TravelAddress, index: number) => (
        <div
          key={index}
          className="mb-4 p-3 border rounded-md bg-white shadow-sm relative"
        >
          <h4 className="font-medium mb-2">Address {index + 1}</h4>
          {addresses.length > 0 && (
            <button
              type="button"
              onClick={() => removeAddress(index)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs hover:bg-red-600"
            >
              &times;
            </button>
          )}
          {/* Now using DynamicFormRenderer for each address */}
          <DynamicFormRenderer<TravelAddress>
            configKey="travelAddress" // Use a consistent key for the address config
            formData={address}
            errors={
              (formErrors.addresses &&
              typeof formErrors.addresses === 'object' &&
              (formErrors.addresses as any)[index]
                ? (formErrors.addresses as any)[index]
                : {}) as FormErrors
            } // Pass errors specific to this address
            onFormChange={onAddressFormChange(index)} // Pass a handler for this specific address
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
        onClick={addAddress}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Add Address
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
export default TravelAddressesForm
