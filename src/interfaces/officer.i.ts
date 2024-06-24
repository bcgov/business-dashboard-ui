// copied from business-filings-ui repo
export interface OfficerI {
  firstName?: string // required for party type = PERSON
  lastName?: string // required for party type = PERSON
  middleInitial?: string
  prevFirstName?: string
  prevLastName?: string
  prevMiddleInitial?: string
  organizationName?: string // required for party type = ORGANIZATION
  partyType?: PartyTypeE
  email?: string
  taxId?: string
}
