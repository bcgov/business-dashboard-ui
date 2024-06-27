export interface PartyI {
  deliveryAddress: AddressI
  mailingAddress: AddressI
  officer: OfficerI
  roles: RoleI[]
}

export interface PartiesI {
  parties: PartyI[]
}
