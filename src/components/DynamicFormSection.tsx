import React from 'react'
import { travelFormConfigs } from '../config/formConfig'
import { FormErrors, TravelRegularDataEntry } from '../types/formTypes'
import TravelAddressesForm from './TravelAddressForm'

interface DynamicFormSectionProps {
  configKey: string
  formData: TravelRegularDataEntry
  errors: FormErrors
  updateFormData: (fieldId: keyof TravelRegularDataEntry, value: any) => void
  setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
  dateInputEventHelper: (event: any) => boolean
  dateBlurEventHelper: (event: any) => Date | null
  onAddAddress: (formId: number) => void // Placeholder, might need adjustment based on how it's used
  onRemoveAddress: (formId: number) => (addressId: number) => void // Placeholder
  onChangeAddress: (formId: number) => (addressId: number, data: any) => void // Placeholder
  formId: number // Added to help pass down to address handlers
}

const DynamicFormSection: React.FC<DynamicFormSectionProps> = ({
  configKey,
  formData,
  errors,
  updateFormData,
  setErrors,
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

  // General change handler for basic input fields
  const handleChange =
    (fieldId: keyof TravelRegularDataEntry) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >
    ) => {
      updateFormData(fieldId, e.target.value)
    }

  const handleRadioChange =
    (fieldId: keyof TravelRegularDataEntry) => (value: string) => {
      updateFormData(fieldId, value)
    }

  const handleFileChange =
    (fieldId: keyof TravelRegularDataEntry) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        updateFormData(fieldId, e.target.files[0])
      } else {
        updateFormData(fieldId, null)
      }
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
      {config.fields.map((field, idx) => {
        // Check condition for field visibility
        if (field.condition && !field.condition(formData)) {
          return null
        }

        const commonProps = {
          id: field.id as string,
          name: field.id as string,
          className:
            'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2',
          placeholder: field.placeholder
        }

        const fieldValue = formData[field.id as keyof TravelRegularDataEntry]
        const fieldError = errors[field.id]

        return (
          <div key={field.id as string} className="mb-4">
            <label
              htmlFor={field.id as string}
              className="block text-sm font-medium text-gray-700"
            >
              {field.label}
              {typeof field.required === 'function'
                ? field.required(formData)
                  ? ' *'
                  : ''
                : field.required
                ? ' *'
                : ''}
            </label>
            {field.type === 'text' && (
              <input
                type="text"
                value={(fieldValue as string) || ''}
                onChange={handleChange(
                  field.id as keyof TravelRegularDataEntry
                )}
                {...commonProps}
              />
            )}
            {field.type === 'number' && (
              <input
                type="number"
                value={(fieldValue as unknown as number) || ''}
                onChange={handleChange(
                  field.id as keyof TravelRegularDataEntry
                )}
                {...commonProps}
              />
            )}
            {field.type === 'textarea' && (
              <textarea
                value={(fieldValue as string) || ''}
                onChange={handleChange(
                  field.id as keyof TravelRegularDataEntry
                )}
                rows={3}
                {...commonProps}
              ></textarea>
            )}
            {field.type === 'select' && (
              <select
                value={(fieldValue as string) || ''}
                onChange={handleChange(
                  field.id as keyof TravelRegularDataEntry
                )}
                {...commonProps}
              >
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            {field.type === 'radio' && (
              <div className="mt-1 space-x-4">
                {field.options?.map((option) => (
                  <label
                    key={option.value}
                    className="inline-flex items-center"
                  >
                    <input
                      type="radio"
                      name={field.id as string}
                      value={option.value}
                      checked={fieldValue === option.value}
                      onChange={() =>
                        handleRadioChange(
                          field.id as keyof TravelRegularDataEntry
                        )(option.value)
                      }
                      className="form-radio"
                    />
                    <span className="ml-2 text-gray-900">{option.label}</span>
                  </label>
                ))}
              </div>
            )}
            {field.type === 'file' && (
              <input
                type="file"
                onChange={handleFileChange(
                  field.id as keyof TravelRegularDataEntry
                )}
                {...commonProps}
              />
            )}
            {field.type === 'date' && (
              <input
                type="date"
                value={
                  fieldValue instanceof Date
                    ? fieldValue.toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) =>
                  updateFormData(
                    field.id as keyof TravelRegularDataEntry,
                    e.target.value ? new Date(e.target.value) : null
                  )
                }
                onInput={dateInputEventHelper} // Not used for validation directly here
                onBlur={(e) =>
                  updateFormData(
                    field.id as keyof TravelRegularDataEntry,
                    dateBlurEventHelper(e)
                  )
                }
                {...commonProps}
              />
            )}
            {field.component === 'TravelAddressesForm' && (
              <TravelAddressesForm
                addresses={formData.travelAddress || []}
                onChange={(updatedAddresses) =>
                  updateFormData('travelAddress', updatedAddresses)
                }
                formErrors={errors}
                setFormErrors={setErrors} // Pass setErrors from DynamicFormRenderer
              />
            )}
            {fieldError && typeof fieldError === 'string' && (
              <p className="text-red-500 text-sm mt-1">{fieldError}</p>
            )}
          </div>
        )
      })}
    </div>
  )
}
export default DynamicFormSection
