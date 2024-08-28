import type { CorpTypeCd, NrRequestActionCodes } from '@bcrs-shared-components/enums'

export interface NameRequestI {
  applicants: {
    addrLine1: string
    addrLine2: string | null
    addrLine3: string | null
    city: string
    countryTypeCd: string // two letter code
    postalCd: string
    stateProvinceCd: string // two letter code
    clientFirstName: string | null
    clientLastName: string | null
    contact: string // may be empty string
    emailAddress: string
    faxNumber: string | null
    firstName: string
    lastName: string
    middleName: string | null
    phoneNumber: string
    partyId: string
  }
  consentFlag: string | null
  expirationDate: string
  legalType: CorpTypeCd
  names: { name: string, state: NameRequestStateE }[]
  natureBusinessInfo: string
  nrNum: string
  request_action_cd: NrRequestActionCodes
  state: NameRequestStateE
}
