// --- src/types/formTypes.ts ---
// Defining the structure for travel addresses, form data, errors, and field configurations.
export interface TravelAddress {
  address: string
  suburb: string
  state: string
  postcode: string
  startDate: Date | null
  endDate: Date | null
}
export interface Child {
  name: string
  age: number | ''
  // Add other child-specific fields here if needed
}
export interface TravelRegularDataEntry {
  purpose: string
  hasChildren: 'yes' | 'no'
  primaryTransportationType: string
  additionalInformation?: string
  uploadItinerary?: File | null
  travelAddress: TravelAddress[] // Array of addresses
  childrenDetails?: Child[] // Array of children
}

// FormErrors can be a string for a top-level field or an object for nested errors (like addresses)
export interface FormErrors {
  [key: string]:
    | string
    | { [key: number]: { [key: string]: string } }
    | undefined
}

// Updated FormFieldConfig to be generic
export interface FormFieldConfig<T = any> {
  // Default to 'any' if T is not specified
  id: keyof T | string // Can be a key of the generic type T or a simple string
  label: string
  type:
    | 'text'
    | 'select'
    | 'radio'
    | 'textarea'
    | 'file'
    | 'number'
    | 'date'
    | 'group'
  options?: Array<{ value: string; label: string }>
  required?: boolean | ((data: T) => boolean) // Required can depend on the generic type T
  condition?: (data: T) => boolean // Condition can depend on the generic type T
  component?: 'TravelAddressesForm' | 'ChildrenDetailForm' | undefined // Special component rendering for complex fields
  placeholder?: string
}

// Updated FormSectionConfig to be generic
export interface FormSectionConfig<T = TravelRegularDataEntry> {
  // Default to TravelRegularDataEntry
  sectionTitle?: string
  fields: FormFieldConfig<T>[]
  nestedSections?: FormFieldConfig<T>[]
}
