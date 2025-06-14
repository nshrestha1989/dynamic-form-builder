import exp from 'constants'
import { FormErrors, TravelAddress } from '../types/formTypes'

interface TravelAddressesFormProps {
  addresses: TravelAddress[]
  onChange: (updatedAddresses: TravelAddress[]) => void
  formErrors: FormErrors
  setFormErrors: React.Dispatch<React.SetStateAction<FormErrors>> // Passed down for specific address errors
}

const TravelAddressesForm: React.FC<TravelAddressesFormProps> = ({
  addresses,
  onChange,
  formErrors,
  setFormErrors
}) => {
  const addAddress = () => {
    const newAddress: TravelAddress = {
      address: '',
      suburb: '',
      state: '',
      postcode: '',
      startDate: null,
      endDate: null
    }
    onChange([...addresses, newAddress])
  }

  const removeAddress = (indexToRemove: number) => {
    // Remove an address at a specific index
    onChange(addresses.filter((_, index) => index !== indexToRemove))
    // Also remove any related errors for this address
    setFormErrors((prevErrors) => {
      const newErrors = { ...prevErrors }
      if (newErrors.addresses) {
        const currentAddressErrors = newErrors.addresses as {
          [key: number]: { [key: string]: string }
        }
        delete currentAddressErrors[indexToRemove]
        // Re-index subsequent errors if any
        const reIndexedErrors: { [key: number]: { [key: string]: string } } = {}
        Object.keys(currentAddressErrors).forEach((key) => {
          const numKey = Number(key)
          if (numKey > indexToRemove) {
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
    })
  }

  const handleAddressChange = (
    index: number,
    field: keyof TravelAddress,
    value: any
  ) => {
    // Update a specific field in a specific address
    const updatedAddresses = addresses.map((addr, i) =>
      i === index ? { ...addr, [field]: value } : addr
    )
    onChange(updatedAddresses)

    // Basic validation for dates
    if (field === 'startDate' || field === 'endDate') {
      const currentAddress = updatedAddresses[index]
      const start = currentAddress.startDate
      const end = currentAddress.endDate

      if (start && end && new Date(start) > new Date(end)) {
        setFormErrors((prevErrors) => ({
          ...prevErrors,
          addresses: {
            ...((prevErrors.addresses || {}) as {
              [key: number]: { [key: string]: string }
            }),
            [index]: {
              ...((
                (prevErrors.addresses || {}) as {
                  [key: number]: { [key: string]: string }
                }
              )[index] || {}),
              endDate: 'End Date cannot be before Start Date'
            }
          }
        }))
      } else {
        setFormErrors((prevErrors) => {
          const newErrors = { ...prevErrors }
          if (newErrors.addresses) {
            const currentAddressErrors = newErrors.addresses as {
              [key: number]: { [key: string]: string }
            }
            if (
              currentAddressErrors[index] &&
              currentAddressErrors[index].endDate
            ) {
              delete currentAddressErrors[index].endDate
              if (Object.keys(currentAddressErrors[index]).length === 0) {
                delete currentAddressErrors[index]
              }
            }
            if (Object.keys(currentAddressErrors).length === 0) {
              delete newErrors.addresses
            }
          }
          return newErrors
        })
      }
    }
  }

  return (
    <div className="border p-4 rounded-md bg-gray-50">
      <h3 className="text-lg font-semibold mb-3">Travel Addresses</h3>
      {addresses.map((address, index) => (
        <div
          key={index}
          className="mb-4 p-3 border rounded-md bg-white shadow-sm relative"
        >
          <h4 className="font-medium mb-2">Address {index + 1}</h4>
          {addresses.length > 0 && (
            <button
              type="button"
              onClick={() => removeAddress(index)}
              className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full text-xs hover:bg-red-600"
            >
              &times;
            </button>
          )}
          {/* Render input fields for each address property */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Address Line
              </label>
              <input
                type="text"
                value={address.address}
                onChange={(e) =>
                  handleAddressChange(index, 'address', e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                placeholder="Street Address"
              />
              {(formErrors.addresses as any)?.[index]?.address && (
                <p className="text-red-500 text-xs mt-1">
                  {(formErrors.addresses as any)[index].address}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Suburb
              </label>
              <input
                type="text"
                value={address.suburb}
                onChange={(e) =>
                  handleAddressChange(index, 'suburb', e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                placeholder="Suburb"
              />
              {(formErrors.addresses as any)?.[index]?.suburb && (
                <p className="text-red-500 text-xs mt-1">
                  {(formErrors.addresses as any)[index].suburb}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                value={address.state}
                onChange={(e) =>
                  handleAddressChange(index, 'state', e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                placeholder="State"
              />
              {(formErrors.addresses as any)?.[index]?.state && (
                <p className="text-red-500 text-xs mt-1">
                  {(formErrors.addresses as any)[index].state}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Postcode
              </label>
              <input
                type="text"
                value={address.postcode}
                onChange={(e) =>
                  handleAddressChange(index, 'postcode', e.target.value)
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
                placeholder="Postcode"
              />
              {(formErrors.addresses as any)?.[index]?.postcode && (
                <p className="text-red-500 text-xs mt-1">
                  {(formErrors.addresses as any)[index].postcode}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Date
              </label>
              <input
                type="date"
                value={
                  address.startDate
                    ? address.startDate.toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) =>
                  handleAddressChange(
                    index,
                    'startDate',
                    e.target.value ? new Date(e.target.value) : null
                  )
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
              />
              {(formErrors.addresses as any)?.[index]?.startDate && (
                <p className="text-red-500 text-xs mt-1">
                  {(formErrors.addresses as any)[index].startDate}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                End Date
              </label>
              <input
                type="date"
                value={
                  address.endDate
                    ? address.endDate.toISOString().split('T')[0]
                    : ''
                }
                onChange={(e) =>
                  handleAddressChange(
                    index,
                    'endDate',
                    e.target.value ? new Date(e.target.value) : null
                  )
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
              />
              {(formErrors.addresses as any)?.[index]?.endDate && (
                <p className="text-red-500 text-xs mt-1">
                  {(formErrors.addresses as any)[index].endDate}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addAddress}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Add Address
      </button>
    </div>
  )
}
export default TravelAddressesForm
