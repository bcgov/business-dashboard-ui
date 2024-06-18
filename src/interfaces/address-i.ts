export interface AddressI {
  addressCity: string
  addressCountry: string
  addressRegion: string
  postalCode: string
  streetAddress: string
  streetAdditional?: string
  locationDescription?: string
}

export interface EntityAddressI extends AddressI {
  id: number
  addressType: AddressTypeE
  deliveryInstructions: string
  streetAddressAdditional: string
}

export interface deliveryAndMailingAddressI {
  deliveryAddress: AddressI
  mailingAddress: AddressI
}

// To confirm: do all businesses have registered office?
export interface EntityAddressCollectionI {
  registeredOffice: deliveryAndMailingAddressI
  recordsOffice?: deliveryAndMailingAddressI
}
