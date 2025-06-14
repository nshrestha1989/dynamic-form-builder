// --- src/config/formConfigs.ts ---

import { FormSectionConfig } from '../types/formTypes'

// Configuration for various dynamic forms.
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
        condition: (data) => data.primaryTransportationType === 'plane',
        placeholder: 'Any specific flight details?'
      },
      { id: 'uploadItinerary', label: 'Upload Itinerary', type: 'file' },
      {
        id: 'travelAddress',
        label: 'Travel Addresses',
        type: 'group',
        component: 'TravelAddressesForm',
        required: (data) => data.primaryTransportationType === 'car' // Example conditional requirement
      }
    ]
  }
}
