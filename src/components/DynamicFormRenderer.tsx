import {
  childrenSectionConfig,
  travelAddressSectionConfig,
  travelFormConfigs
} from '../config/formConfig'
import {
  FormErrors,
  FormSectionConfig,
  TravelRegularDataEntry
} from '../types/formTypes'
import ChildrenDetailForm from './ChildrenDetailForm'
import GenericFieldRenderer from './GenericFieldRenderer'
import TravelAddressesForm from './TravelAddressForm'

interface DynamicFormRendererProps<T extends object = TravelRegularDataEntry> {
  configKey: string
  formData: T // Now generic
  errors: FormErrors
  onFormChange: (updatedData: T) => void // Callback to update parent's formData, now generic
  onErrorsChange: React.Dispatch<React.SetStateAction<FormErrors>>
  formId: number
  // Add these if DynamicFormRenderer is ever used directly for addresses and needs these props
  onAddAddress?: (formId: number) => void
  onRemoveAddress?: (formId: number) => (addressId: number) => void
  onChangeAddress?: (formId: number) => (addressId: number, data: any) => void
}

const DynamicFormRenderer = <T extends object = TravelRegularDataEntry>({
  configKey,
  formData,
  errors,
  onFormChange,
  onErrorsChange,
  formId,
  onAddAddress,
  onRemoveAddress,
  onChangeAddress
}: DynamicFormRendererProps<T>) => {
  // Determine which config to use based on configKey
  let config: FormSectionConfig<T> | undefined

  if (configKey === 'travelAddress') {
    config = travelAddressSectionConfig as FormSectionConfig<T>
  } else if (configKey === 'childrenDetails') {
    config = childrenSectionConfig as FormSectionConfig<T>
  } else {
    config = travelFormConfigs[configKey] as FormSectionConfig<T>
  }

  if (!config) {
    return <p>Form configuration not found for key: {configKey}</p>
  }

  // Example of a global validation function passed down
  const validateField = (
    fieldId: keyof any, // generic fieldId
    value: any,
    additionalValidation: boolean,
    currentFormData: any // generic currentFormData
  ): boolean => {
    let isValid = true
    let errorMessage: string | undefined
    const fieldConfig = config.fields.find((f) => f.id === fieldId)

    if (!fieldConfig) return true // Field not found in config, assume valid

    const isRequired =
      typeof fieldConfig.required === 'function'
        ? fieldConfig.required(currentFormData)
        : fieldConfig.required

    if (isRequired && (value === null || value === '' || value === undefined)) {
      isValid = false
      errorMessage = `${fieldConfig.label} is required.`
    }

    onErrorsChange((prevErrors) => {
      const newErrors = { ...prevErrors }
      if (errorMessage) {
        newErrors[String(fieldId)] = errorMessage
      } else {
        delete newErrors[String(fieldId)]
      }
      return newErrors
    })

    return isValid
  }

  const updateFormData = (
    fieldId: keyof any, // generic fieldId
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
      <h1 className="text-2xl font-bold mb-4">
        Dynamic Form: {config.sectionTitle || 'Section'}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Render fields directly using GenericFieldRenderer within DynamicFormRenderer */}
        <GenericFieldRenderer<T, FormErrors> // GenericFieldRenderer should handle the specific data type
          data={formData}
          errors={errors}
          fieldConfigs={config.fields}
          onFieldChange={updateFormData}
        />
      </div>

      {/* Conditionally render TravelAddressesForm if it's part of this config */}
      {config.nestedSections?.find(
        (field) => field.component === 'TravelAddressesForm'
      ) && (
        <>
          <TravelAddressesForm
            addresses={(formData as TravelRegularDataEntry).travelAddress || []}
            onChange={(updatedAddresses) =>
              updateFormData('travelAddress' as keyof any, updatedAddresses)
            }
            formErrors={errors}
            setFormErrors={onErrorsChange}
          />
        </>
      )}
      {config.nestedSections?.find(
        (field) =>
          field.component === 'ChildrenDetailForm' &&
          typeof field.condition === 'function' &&
          field.condition(formData)
      ) && (
        <>
          <ChildrenDetailForm
            children={
              (formData as TravelRegularDataEntry).childrenDetails || []
            }
            onChange={(updatedAddresses) =>
              updateFormData('childrenDetails' as keyof any, updatedAddresses)
            }
            formErrors={errors}
            setFormErrors={onErrorsChange}
          />
        </>
      )}
    </div>
  )
}
export default DynamicFormRenderer
