import { travelFormConfigs } from '../config/formConfig'
import { FormErrors, TravelRegularDataEntry } from '../types/formTypes'
import DynamicFormSection from './DynamicFormSection'

interface DynamicFormRendererProps {
  configKey: string
  formData: TravelRegularDataEntry
  errors: FormErrors
  onFormChange: (updatedData: TravelRegularDataEntry) => void
  onErrorsChange: React.Dispatch<React.SetStateAction<FormErrors>>
  formId: number
}

const DynamicFormRenderer: React.FC<DynamicFormRendererProps> = ({
  configKey,
  formData,
  errors,
  onFormChange,
  onErrorsChange,
  formId
}) => {
  const config = travelFormConfigs[configKey]

  // Example of a global validation function passed down
  const validateField = (
    fieldId: keyof TravelRegularDataEntry,
    value: any,
    additionalValidation: boolean,
    currentFormData: TravelRegularDataEntry // Pass current form data
  ): boolean => {
    let isValid = true
    let errorMessage: string | undefined
    const fieldConfig = config.fields.find(
      (f: { id: string }) => f.id === fieldId
    )

    if (!fieldConfig) return true // Field not found in config, assume valid

    const isRequired =
      typeof fieldConfig.required === 'function'
        ? fieldConfig.required(currentFormData)
        : fieldConfig.required

    if (isRequired && (value === null || value === '' || value === undefined)) {
      isValid = false
      errorMessage = `${fieldConfig.label} is required.`
    }

    // Add more specific validation logic here if needed (e.g., email format, number range)
    // For travelAddress, validation is handled in TravelAddressesForm.

    onErrorsChange((prevErrors) => {
      const newErrors = { ...prevErrors }
      if (errorMessage) {
        newErrors[fieldId] = errorMessage
      } else {
        delete newErrors[fieldId]
      }
      return newErrors
    })

    return isValid
  }

  const updateFormData = (
    fieldId: keyof TravelRegularDataEntry,
    value: any,
    additionalValidation = false // This flag can be used for blur/submit validation distinction
  ) => {
    const updatedData = { ...formData, [fieldId]: value }
    onFormChange(updatedData) // Pass updated data up to the parent
    validateField(fieldId, value, additionalValidation, updatedData) // Validate and update errors via onErrorsChange
  }

  // Date helpers (these are now local to DynamicFormRenderer but could be passed from parent if shared)
  const dateInputEventHelper = (event: any): boolean => {
    // Basic check for valid date format or empty string
    return event?.target?.value !== undefined
  }

  const dateBlurEventHelper = (event: any): Date | null => {
    return event?.target?.value ? new Date(event.target.value) : null
  }

  return (
    <div
      style={{
        padding: '20px',
        maxWidth: '800px',
        margin: '20px auto',
        border: '1px solid #ccc',
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}
    >
      <h1 className="text-2xl font-bold mb-4">Dynamic Form: {configKey}</h1>
      <DynamicFormSection
        configKey={configKey}
        formData={formData}
        errors={errors}
        updateFormData={updateFormData} // Pass this down
        setErrors={onErrorsChange} // Pass the parent's error setter down
        dateInputEventHelper={dateInputEventHelper}
        dateBlurEventHelper={dateBlurEventHelper}
        formId={formId}
        onAddAddress={() => console.log('Add address via parent callback')} // These are now just placeholders, actual logic is in TravelFormExample
        onRemoveAddress={() => (addressId: number) =>
          console.log('Remove address via parent callback')}
        onChangeAddress={() => (addressId: number, data: any) =>
          console.log('Change address via parent callback')}
      />
      <pre
        style={{
          backgroundColor: '#eee',
          padding: '10px',
          borderRadius: '5px',
          marginTop: '20px',
          overflowX: 'auto',
          fontSize: '0.8em'
        }}
      >
        <h2>Current Form Data:</h2>
        {JSON.stringify(formData, null, 2)}
        <h2>Current Errors:</h2>
        {JSON.stringify(errors, null, 2)}
      </pre>
    </div>
  )
}
export default DynamicFormRenderer
