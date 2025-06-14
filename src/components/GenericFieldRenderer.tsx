// --- src/components/GenericFieldRenderer.tsx ---

import { FormErrors, FormFieldConfig } from '../types/formTypes'

// New generic component to render fields based on config
interface GenericFieldRendererProps<
  T extends object,
  ErrorsT extends FormErrors
> {
  data: T
  errors: ErrorsT
  fieldConfigs: FormFieldConfig<T>[] // Updated to be generic
  onFieldChange: (fieldId: keyof T, value: any) => void
  // Index for unique IDs within repeatable sections (like addresses)
  index?: number
}

const GenericFieldRenderer = <T extends object, ErrorsT extends FormErrors>({
  data,
  errors,
  fieldConfigs,
  onFieldChange,
  index // Destructure index
}: GenericFieldRendererProps<T, ErrorsT>) => {
  return (
    <>
      {fieldConfigs.map((fieldConfig: FormFieldConfig<T>) => {
        // Updated to be generic
        // Handle fields with conditions
        if (fieldConfig.condition && !fieldConfig.condition(data)) {
          return null
        }

        const fieldId = fieldConfig.id as keyof T
        const fieldValue = data[fieldId]
        // Access errors more generically
        const fieldError = errors[fieldId as keyof typeof errors]

        // Create a unique ID for each input, especially important for repeatable sections
        const uniqueId =
          index !== undefined ? `${String(fieldId)}-${index}` : String(fieldId)

        const commonProps = {
          id: uniqueId as string,
          name: uniqueId as string,
          className:
            'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2',
          placeholder: fieldConfig.placeholder
        }

        return (
          <div key={uniqueId as string}>
            <label
              htmlFor={commonProps.id}
              className="block text-sm font-medium text-gray-700"
            >
              {fieldConfig.label}
              {typeof fieldConfig.required === 'function'
                ? fieldConfig.required(data)
                  ? ' *'
                  : ''
                : fieldConfig.required
                ? ' *'
                : ''}
            </label>
            {fieldConfig.type === 'text' && (
              <input
                type="text"
                value={(fieldValue as string) || ''}
                onChange={(e) => onFieldChange(fieldId, e.target.value)}
                {...commonProps}
              />
            )}
            {fieldConfig.type === 'number' && (
              <input
                type="number"
                value={(fieldValue as number) || ''}
                onChange={(e) => onFieldChange(fieldId, e.target.value)}
                {...commonProps}
              />
            )}
            {fieldConfig.type === 'textarea' && (
              <textarea
                value={(fieldValue as string) || ''}
                onChange={(e) => onFieldChange(fieldId, e.target.value)}
                rows={3}
                {...commonProps}
              ></textarea>
            )}
            {fieldConfig.type === 'select' && (
              <select
                value={(fieldValue as string) || ''}
                onChange={(e) => onFieldChange(fieldId, e.target.value)}
                {...commonProps}
              >
                {fieldConfig.options?.map(
                  (option: { value: string; label: string }) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  )
                )}
              </select>
            )}
            {fieldConfig.type === 'radio' && (
              <div className="mt-1 space-x-4">
                {fieldConfig.options?.map(
                  (option: { value: string; label: string }) => (
                    <label
                      key={option.value}
                      className="inline-flex items-center"
                    >
                      <input
                        type="radio"
                        name={commonProps.name} // Use name from commonProps for radio group
                        value={option.value}
                        checked={fieldValue === option.value}
                        onChange={() => onFieldChange(fieldId, option.value)}
                        className="form-radio"
                      />
                      <span className="ml-2 text-gray-900">{option.label}</span>
                    </label>
                  )
                )}
              </div>
            )}
            {fieldConfig.type === 'file' && (
              <input
                type="file"
                onChange={(e) =>
                  onFieldChange(
                    fieldId,
                    e.target.files ? e.target.files[0] : null
                  )
                }
                {...commonProps}
              />
            )}
            {fieldConfig.type === 'date' && (
              <input
                type="date"
                value={
                  fieldValue instanceof Date
                    ? fieldValue.toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) =>
                  onFieldChange(
                    fieldId,
                    e.target.value ? new Date(e.target.value) : null
                  )
                }
                {...commonProps}
              />
            )}
            {fieldError && typeof fieldError === 'string' && (
              <p className="text-red-500 text-xs mt-1">{fieldError}</p>
            )}
          </div>
        )
      })}
    </>
  )
}
export default GenericFieldRenderer
