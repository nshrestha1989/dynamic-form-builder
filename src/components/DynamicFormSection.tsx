import React from 'react'
import { travelFormConfigs } from '../config/formConfig'
import { FormErrors, TravelRegularDataEntry } from '../types/formTypes'
import TravelAddressesForm from './TravelAddressForm'
import GenericFieldRenderer from './GenericFieldRenderer'

// --- src/components/DynamicFormSection.tsx ---
interface DynamicFormSectionProps {
  configKey: string
  formData: TravelRegularDataEntry
  errors: FormErrors
  updateFormData: (fieldId: keyof TravelRegularDataEntry, value: any) => void
  // Changed setErrors to match onErrorsChange from parent
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>> // Expects the full updated errors object
  dateInputEventHelper: (event: any) => boolean
  dateBlurEventHelper: (event: any) => Date | null
  onAddAddress: (formId: number) => void
  onRemoveAddress: (formId: number) => (addressId: number) => void
  onChangeAddress: (formId: number) => (addressId: number, data: any) => void
  formId: number
}

const DynamicFormSection: React.FC<DynamicFormSectionProps> = ({
  configKey,
  formData,
  errors,
  updateFormData,
  setErrors, // This is now a direct setter for the errors object
  dateInputEventHelper,
  dateBlurEventHelper,
  onAddAddress,
  onRemoveAddress,
  onChangeAddress,
  formId
}) => {
  const config = travelFormConfigs[configKey]

  if (!config) {
    return <p>Form configuration not found for key: {configKey}</p>
  }

  // Memoized address handlers to avoid re-rendering TravelAddressesForm unnecessarily
  const memoizedOnAddAddress = React.useCallback(
    () => onAddAddress(formId),
    [onAddAddress, formId]
  )
  const memoizedOnRemoveAddress = React.useCallback(
    (addressId: number) => onRemoveAddress(formId)(addressId),
    [onRemoveAddress, formId]
  )
  const memoizedOnChangeAddress = React.useCallback(
    (addressId: number, data: any) => onChangeAddress(formId)(addressId, data),
    [onChangeAddress, formId]
  )

  return (
    <div className="space-y-4">
      {config.sectionTitle && (
        <h2 className="text-xl font-bold mb-4">{config.sectionTitle}</h2>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GenericFieldRenderer<TravelRegularDataEntry, FormErrors>
          data={formData}
          errors={errors}
          fieldConfigs={config.fields.filter(
            (f) => f.component !== 'TravelAddressesForm'
          )} // Filter out the special component
          onFieldChange={updateFormData}
        />
      </div>

      {/* Render TravelAddressesForm separately if configured */}
      {config.fields.find(
        (field) => field.component === 'TravelAddressesForm'
      ) && (
        <TravelAddressesForm
          addresses={formData.travelAddress || []}
          onChange={(updatedAddresses) =>
            updateFormData('travelAddress', updatedAddresses)
          }
          formErrors={errors}
          setFormErrors={setErrors} // Pass the parent's error setter down
        />
      )}
    </div>
  )
}
export default DynamicFormSection
