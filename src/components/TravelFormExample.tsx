import { useState } from 'react'
import {
  FormErrors,
  FormFieldConfig,
  TravelAddress,
  TravelRegularDataEntry
} from '../types/formTypes'
import {
  travelAddressSectionConfig,
  travelFormConfigs
} from '../config/formConfig'
import DynamicFormRenderer from './DynamicFormRenderer'

export const TravelFormExample: React.FC = () => {
  const [forms, setForms] = useState<{
    [key: number]: {
      formData: TravelRegularDataEntry
      errors: FormErrors
    }
  }>({
    0: {
      formData: {
        purpose: '',
        hasChildren: 'no',
        primaryTransportationType: '',
        additionalInformation: '',
        uploadItinerary: null,
        travelAddress: []
      },
      errors: {}
    }
  })

  const [formIds, setFormIds] = useState<number[]>([0])
  const [alertDialog, setAlertDialog] = useState({
    show: false,
    title: '',
    description: ''
  })

  // Centralized update function for formData for a specific formId
  const handleFormChange = (
    formId: number,
    updatedData: TravelRegularDataEntry
  ) => {
    setForms((prev) => ({
      ...prev,
      [formId]: {
        ...prev[formId],
        formData: updatedData
      }
    }))
  }

  // Centralized update function for errors for a specific formId
  // This now accepts the fully updated errors object directly
  const handleErrorsChange = (formId: number, updatedErrors: FormErrors) => {
    setForms((prev) => ({
      ...prev,
      [formId]: {
        ...prev[formId],
        errors: updatedErrors
      }
    }))
  }

  // Enhanced validateEntireForm to properly validate nested addresses
  const validateEntireForm = (formId: number): boolean => {
    // Explicitly define return type
    const currentForm = forms[formId]
    let isValid = true
    const newErrors: FormErrors = {} // Start with a fresh error object for this validation pass

    // Validate main form fields
    const currentConfig = travelFormConfigs.IntrastateTemporaryDetails
    if (currentConfig) {
      currentConfig.fields.forEach(
        (field: FormFieldConfig<TravelRegularDataEntry>) => {
          // Explicitly typed 'field'
          // Only validate fields that are visible/applicable based on their condition
          if (
            field.component !== 'TravelAddressesForm' &&
            field.condition &&
            !field.condition(currentForm.formData)
          ) {
            return // Skip validation for hidden fields (non-address fields)
          }

          const fieldValue =
            currentForm.formData[field.id as keyof TravelRegularDataEntry]
          const isRequired =
            typeof field.required === 'function'
              ? field.required(currentForm.formData)
              : field.required

          if (
            isRequired &&
            (fieldValue === null ||
              fieldValue === '' ||
              fieldValue === undefined)
          ) {
            // Special handling for travelAddress field itself being required but empty
            if (
              field.id === 'travelAddress' &&
              (fieldValue as unknown as TravelAddress[]).length === 0
            ) {
              newErrors[field.id] = `${field.label} is required`
              isValid = false
            } else if (field.id !== 'travelAddress') {
              // Apply for non-address fields
              newErrors[field.id] = `${field.label} is required`
              isValid = false
            }
          }
        }
      )
    }

    // Enhanced validation for travel addresses
    const addresses = currentForm.formData.travelAddress || []
    const addressErrors: { [key: number]: { [key: string]: string } } = {}

    if (
      addresses.length === 0 &&
      (() => {
        const travelAddressField = currentConfig?.fields.find(
          (f: FormFieldConfig) => f.id === 'travelAddress'
        )
        if (typeof travelAddressField?.required === 'function') {
          return travelAddressField.required(currentForm.formData)
        }
        return !!travelAddressField?.required
      })()
    ) {
      newErrors.travelAddress = 'At least one travel address is required'
      isValid = false
    } else {
      addresses.forEach((address: TravelAddress, index: number) => {
        // Explicitly typed
        const currentAddressErrors: { [key: string]: string } = {}
        travelAddressSectionConfig.fields.forEach((fieldConfig) => {
          // Use the shared config for address fields
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
            currentAddressErrors[fieldId] = `${fieldConfig.label} is required`
            isValid = false
          }
        })

        if (address.startDate && address.endDate) {
          const startDate = new Date(address.startDate)
          const endDate = new Date(address.endDate)
          if (startDate > endDate) {
            currentAddressErrors.endDate =
              'End Date cannot be before Start Date'
            isValid = false
          }
        }
        if (Object.keys(currentAddressErrors).length > 0) {
          addressErrors[index] = currentAddressErrors
        }
      })
      // Attach address errors to the main errors object if any exist
      if (Object.keys(addressErrors).length > 0) {
        newErrors.addresses = addressErrors
      }
    }

    // Update form errors in state
    setForms((prev) => ({
      ...prev,
      [formId]: {
        ...prev[formId],
        errors: newErrors
      }
    }))

    return isValid && Object.keys(newErrors).length === 0
  }

  // Modified handleAddForm to show all validation messages
  const handleAddForm = () => {
    // Validate all existing forms before adding a new one
    const areAllExistingFormsValid = formIds.every((formId) => {
      return validateEntireForm(formId)
    })

    if (!areAllExistingFormsValid) {
      // Collect all errors from all forms to display in a single alert
      let fullErrorMessage =
        'Please fix the following errors before adding a new form:\n\n'
      let hasErrorToDisplay = false

      formIds.forEach((formId) => {
        const formErrors = forms[formId].errors
        if (Object.keys(formErrors).length > 0) {
          hasErrorToDisplay = true
          fullErrorMessage += `Errors in Form ${formId + 1}:\n`

          // Add main form errors
          Object.entries(formErrors).forEach(([field, error]) => {
            if (typeof error === 'string') {
              fullErrorMessage += `\n- ${error}`
            }
          })

          // Add nested address errors with more detail
          if (formErrors.addresses) {
            Object.entries(formErrors.addresses).forEach(
              ([addressIndex, addressErrors]) => {
                fullErrorMessage += `\n\n  Travel Address ${
                  Number(addressIndex) + 1
                }:`
                Object.entries(
                  addressErrors as { [key: string]: string }
                ).forEach(([field, error]) => {
                  fullErrorMessage += `\n  - ${field}: ${error}`
                })
              }
            )
          }
          fullErrorMessage += '\n\n' // Add spacing between forms
        }
      })

      if (hasErrorToDisplay) {
        setAlertDialog({
          show: true,
          title: 'Validation Error',
          description: fullErrorMessage
        })
      }
      return // Stop execution if any form has errors
    }

    // If all forms are valid, add new form
    const newFormId = formIds.length > 0 ? Math.max(...formIds) + 1 : 0
    setForms((prev) => ({
      ...prev,
      [newFormId]: {
        formData: {
          purpose: '',
          hasChildren: 'no',
          primaryTransportationType: '',
          additionalInformation: '',
          uploadItinerary: null,
          travelAddress: []
        },
        errors: {}
      }
    }))
    setFormIds((prev) => [...prev, newFormId])
  }

  // Remove form handler
  const handleRemoveForm = (formId: number) => {
    setForms((prev) => {
      const newForms = { ...prev }
      delete newForms[formId]
      return newForms
    })
    setFormIds((prev) => prev.filter((id) => id !== formId))
  }

  // Date helpers (defined here as they are relevant for overall form management)
  const dateInputEventHelper = (event: any) => true // Basic pass-through
  const dateBlurEventHelper = (event: any) =>
    event?.target?.value ? new Date(event.target.value) : null

  // Address handlers
  const onAddAddress = (formId: number) => {
    setForms((prev) => {
      const currentFormData = prev[formId].formData
      return {
        ...prev,
        [formId]: {
          ...prev[formId],
          formData: {
            ...currentFormData,
            travelAddress: [
              ...(currentFormData.travelAddress || []),
              {
                address: '',
                suburb: '',
                state: '',
                postcode: '',
                startDate: null,
                endDate: null
              }
            ]
          }
        }
      }
    })
  }

  const onRemoveAddress = (formId: number) => (addressId: number) => {
    setForms((prev) => {
      const currentFormData = prev[formId].formData
      return {
        ...prev,
        [formId]: {
          ...prev[formId],
          formData: {
            ...currentFormData,
            travelAddress: (currentFormData.travelAddress || []).filter(
              (_, index) => index !== addressId
            )
          }
        }
      }
    })
    // Also clear errors associated with the removed address
    handleErrorsChange(
      formId,
      (() => {
        // Pass a function to handleErrorsChange, it will be executed inside
        const prevErrors = forms[formId].errors // Get the latest errors for the form
        const newErrors = { ...prevErrors }
        if (newErrors.addresses) {
          const currentAddressErrors = newErrors.addresses as {
            [key: number]: { [key: string]: string }
          }
          delete currentAddressErrors[addressId]
          // Re-index subsequent errors if any
          const reIndexedErrors: { [key: number]: { [key: string]: string } } =
            {}
          Object.keys(currentAddressErrors).forEach((key) => {
            const numKey = Number(key)
            if (numKey > addressId) {
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
      })()
    ) // Immediately invoke the function to pass the result
  }

  const onChangeAddress =
    (formId: number) => (addressId: number, data: any) => {
      setForms((prev) => {
        const currentFormData = prev[formId].formData
        return {
          ...prev,
          [formId]: {
            ...prev[formId],
            formData: {
              ...currentFormData,
              travelAddress: (currentFormData.travelAddress || []).map(
                (addr, index) =>
                  index === addressId ? { ...addr, ...data } : addr
              )
            }
          }
        }
      })
    }

  return (
    <div className="travel-form-container p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-extrabold text-center text-indigo-800 mb-8">
        Travel Information Forms
      </h1>

      {formIds.map((formId) => (
        <div
          key={formId}
          className="form-wrapper bg-white rounded-xl shadow-lg p-6 mb-8 relative"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Travel Form {formId + 1}
          </h2>
          {formIds.length > 1 && (
            <button
              onClick={() => handleRemoveForm(formId)}
              className="remove-form-button absolute top-6 right-6 px-4 py-2 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition duration-300 ease-in-out"
            >
              Remove Form
            </button>
          )}
          <DynamicFormRenderer
            configKey="IntrastateTemporaryDetails"
            formData={forms[formId].formData}
            errors={forms[formId].errors}
            onFormChange={(updatedData) =>
              handleFormChange(formId, updatedData)
            }
            onErrorsChange={(updatedErrors) => {
              // If updatedErrors is a function (from a child), call it with the current errors
              if (typeof updatedErrors === 'function') {
                handleErrorsChange(formId, updatedErrors(forms[formId].errors))
              } else {
                handleErrorsChange(formId, updatedErrors)
              }
            }}
            formId={formId}
          />
          {/* A local submit button for each form if desired, or rely on global "Submit All" */}
          <button
            type="button"
            onClick={() =>
              validateEntireForm(formId)
                ? console.log(
                    `Form ${formId + 1} is valid!`,
                    forms[formId].formData
                  )
                : console.log(
                    `Form ${formId + 1} has errors.`,
                    forms[formId].errors
                  )
            }
            className="mt-6 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-300 ease-in-out"
          >
            Validate Form {formId + 1}
          </button>
        </div>
      ))}

      <button
        onClick={handleAddForm}
        className="add-form-button block w-full md:w-auto mx-auto px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-xl hover:bg-blue-700 transition duration-300 ease-in-out transform hover:scale-105"
      >
        Add Another Travel Form
      </button>

      {/* Global Submit All Forms button */}
      <button
        onClick={() => {
          let allFormsValid = true
          formIds.forEach((id) => {
            if (!validateEntireForm(id)) {
              allFormsValid = false
            }
          })

          if (allFormsValid) {
            console.log('All forms are valid!', forms)
            setAlertDialog({
              show: true,
              title: 'Success!',
              description: 'All forms are valid and ready for submission.'
            })
            // Here you would typically send all forms data to an API
          } else {
            console.log('Some forms have errors. Please check.')
            // Validation errors are already updated and alert is shown by handleAddForm/validateEntireForm
          }
        }}
        className="block w-full md:w-auto mx-auto mt-8 px-8 py-4 bg-purple-600 text-white text-lg font-semibold rounded-lg shadow-xl hover:bg-purple-700 transition duration-300 ease-in-out transform hover:scale-105"
      >
        Submit All Forms
      </button>

      {alertDialog.show && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="alert-dialog bg-white rounded-lg shadow-xl p-6 max-w-md w-full border border-orange-400">
            <h3 className="text-xl font-bold text-orange-700 mb-3">
              {alertDialog.title}
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {alertDialog.description}
            </p>
            <button
              onClick={() => setAlertDialog({ ...alertDialog, show: false })}
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

// Update styles
const styles = `
  .travel-form-container {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Inter', sans-serif;
  }

  .form-wrapper {
    margin-bottom: 30px;
    padding: 20px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    position: relative;
  }

  .add-form-button {
    display: block;
    margin: 20px auto;
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .remove-form-button {
    position: absolute;
    top: 20px;
    right: 20px;
    padding: 8px 16px;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .alert-dialog {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 15px;
    background-color: #fff;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    border-radius: 4px;
    border: 1px solid #ffb74d;
    z-index: 1000;
  }
`

// Add styles to document
const styleSheet = document.createElement('style')
styleSheet.innerText = styles
document.head.appendChild(styleSheet)

export default TravelFormExample
