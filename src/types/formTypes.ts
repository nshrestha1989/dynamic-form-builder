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

export interface TravelRegularDataEntry {
  purpose: string
  hasChildren: 'yes' | 'no'
  primaryTransportationType: string
  additionalInformation?: string
  uploadItinerary?: File | null
  travelAddress: TravelAddress[] // Array of addresses
}

// FormErrors can be a string for a top-level field or an object for nested errors (like addresses)
export interface FormErrors {
  [key: string]:
    | string
    | { [key: number]: { [key: string]: string } }
    | undefined
}

export interface FormFieldConfig {
  id: keyof TravelRegularDataEntry | string // 'string' allows for sub-fields like address.1.suburb
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
  required?: boolean | ((data: TravelRegularDataEntry) => boolean)
  condition?: (data: TravelRegularDataEntry) => boolean
  component?: 'TravelAddressesForm' // Special component rendering for complex fields
  placeholder?: string
}

export interface FormSectionConfig {
  sectionTitle?: string
  fields: FormFieldConfig[]
}
