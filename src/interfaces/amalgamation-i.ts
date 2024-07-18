import { CorpTypeCd, AmalgamationTypes, CorrectNameOptions } from '@bcrs-shared-components/enums'
import type {
  CompletingPartyIF, ContactPointIF, CourtOrderIF, NameTranslationIF, ShareClassIF
} from '@bcrs-shared-components/interfaces'

/**
 * A filing's amalgamation application object from the API. See:
 * https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/amalgamation_application.json
 */
export interface RegisteredRecordsAddressesI {
  registeredOffice: deliveryAndMailingAddressI
  recordsOffice?: deliveryAndMailingAddressI
}

export interface NameRequestFilingI {
  legalType: CorpTypeCd
  legalName?: string
  nrNumber?: string
  correctNameOption?: CorrectNameOptions
}

export interface AmalgamationApplicationI {
  amalgamatingBusinesses: any[]
  courtApproval: boolean
  type: AmalgamationTypes
  nameRequest: NameRequestFilingI
  nameTranslations: NameTranslationIF[]
  offices: RegisteredRecordsAddressesI | object
  contactPoint: ContactPointIF
  parties: CompletingPartyIF[]

  // BEN / CC / BC / ULC only:
  shareStructure?: {
    shareClasses: ShareClassIF[]
  }
  incorporationAgreement?: {
    agreementType: string
  }
  // ULC only:
  courtOrder?: CourtOrderIF
}

/** Amalgamation Application filing interface. */
export interface AmalgamationApplicationFilingI extends FilingI {
  amalgamationApplication: AmalgamationApplicationI
}
