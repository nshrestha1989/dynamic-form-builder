import {
  Child,
  FormSectionConfig,
  TravelAddress,
  TravelRegularDataEntry
} from '../types/formTypes'

export const travelFormConfigs: { [key: string]: FormSectionConfig } = {
  IntrastateTemporaryDetails: {
    sectionTitle: 'Intrastate Travel Details',
    fields: [
      {
        id: 'purpose',
        label: 'Purpose of Travel',
        type: 'text',
        required: true,
        placeholder: 'e.g., Business Trip'
      },
      {
        id: 'hasChildren',
        label: 'Traveling with children?',
        type: 'radio',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' }
        ],
        required: true
      },
      {
        id: 'primaryTransportationType',
        label: 'Primary Transportation Type',
        type: 'select',
        options: [
          { value: '', label: 'Select...' },
          { value: 'car', label: 'Car' },
          { value: 'plane', label: 'Plane' },
          { value: 'bus', label: 'Bus' }
        ],
        required: true
      },
      {
        id: 'additionalInformation',
        label: 'Additional Information',
        type: 'textarea',
        condition: (data: TravelRegularDataEntry) =>
          data.primaryTransportationType === 'plane', // Explicitly typed 'data'
        placeholder: 'Any specific flight details?'
      },
      { id: 'uploadItinerary', label: 'Upload Itinerary', type: 'file' }
    ],
    nestedSections: [
      {
        id: 'travelAddress',
        label: 'Travel Addresses',
        type: 'group',
        component: 'TravelAddressesForm',
        required: (data: TravelRegularDataEntry) =>
          data.primaryTransportationType === 'car'
      },
      {
        id: 'childrenDetails',
        label: 'Child Details',
        type: 'group',
        component: 'ChildrenDetailForm',
        condition: (data: TravelRegularDataEntry) =>
          data.hasChildren.toLowerCase() === 'yes'
      }
    ]
  }
}

// Defining a specific FormSectionConfig for a single TravelAddress object
export const travelAddressSectionConfig: FormSectionConfig<TravelAddress> = {
  sectionTitle: 'Address Details', // Can be customized
  fields: [
    {
      id: 'address',
      label: 'Address Line',
      type: 'text',
      required: true,
      placeholder: 'Street Address'
    },
    {
      id: 'suburb',
      label: 'Suburb',
      type: 'text',
      required: true,
      placeholder: 'Suburb'
    },
    {
      id: 'state',
      label: 'State',
      type: 'text',
      required: true,
      placeholder: 'State'
    },
    {
      id: 'postcode',
      label: 'Postcode',
      type: 'text',
      required: true,
      placeholder: 'Postcode'
    },
    { id: 'startDate', label: 'Start Date', type: 'date', required: true },
    {
      id: 'endDate',
      label: 'End Date',
      type: 'date',
      required: true,
      condition: (data: TravelAddress) => !!data.startDate // End date only required if start date exists
    }
  ]
}
export const childrenSectionConfig: FormSectionConfig<Child> = {
  sectionTitle: 'Child Details',
  fields: [
    {
      id: 'name',
      label: 'Name',
      type: 'text',
      required: false,
      placeholder: 'Name'
    },
    {
      id: 'age',
      label: 'Age',
      type: 'number',
      required: false,
      placeholder: 'Age'
    }
  ]
}
