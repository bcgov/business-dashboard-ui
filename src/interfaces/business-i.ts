import type { CorpTypeCd, AmalgamationTypes, FilingTypes } from '@bcrs-shared-components/enums'
import type { AlternateNameIF, ApiDateTimeUtc, IsoDatePacific } from '@bcrs-shared-components/interfaces'

import { BusinessStateE } from '~/enums/business-state-e'
import { BusinessTypeE } from '~/enums/business-type-e'
import { FilingSubTypeE } from '~/enums/filing-sub-type-e'
import type { StateFilingHeaderI } from '~/interfaces/state-filing-i'

export interface SlimBusinessI {
  adminFreeze: boolean
  alternateNames: { operatingName: string }[]
  goodStanding: boolean
  identifier: string
  legalName: string
  legalType: CorpTypeCd
  state: BusinessStateE
  taxId?: string
  inDissolution: boolean
}

export interface StateFilingI {
  business: any
  consentContinuationOut?: any
  header: StateFilingHeaderI
  dissolution?: any
  restoration?: any
  putBackOn?: any
}

export interface AllowedActionsI {
  digitalBusinessCard: boolean
  filing: {
    filingSubmissionLink: string
    filingTypes: FilingTypeI[]
  }
}

export interface AmalgamatedIntoI {
  amalgamationDate: ApiDateTimeUtc
  amalgamationType: AmalgamationTypes
  identifier: string // eg, BC7654321
  legalName: string
}

// comments come from business-filings-ui project ApiBusinessIF interface
export interface BusinessI {
  adminFreeze: boolean
  allowedActions: AllowedActionsI
  alternateNames: { operatingName: string }[]
  amalgamatedInto?: AmalgamatedIntoI
  arMaxDate?: IsoDatePacific // not used
  arMinDate?: IsoDatePacific // not used
  associationType: string // COOP only
  complianceWarnings: any[]
  dissolutionDate?: IsoDatePacific // not used
  fiscalYearEndDate?: IsoDatePacific // not used
  foundingDate: ApiDateTimeUtc
  goodStanding: boolean
  hasCorrections: boolean
  hasCourtOrders: boolean
  hasRestrictions: boolean
  identifier: string // eg, BC1234567
  inDissolution?: boolean
  lastAddressChangeDate: IsoDatePacific
  lastAnnualGeneralMeetingDate?: IsoDatePacific // not used
  lastAnnualReportDate: IsoDatePacific
  lastDirectorChangeDate: IsoDatePacific
  lastLedgerTimestamp?: ApiDateTimeUtc // not used
  lastModified?: ApiDateTimeUtc // not used
  legalName: string
  legalType: CorpTypeCd
  naicsCode: string // firm only
  naicsDescription: string // firm only
  naicsKey: string // firm only
  nextAnnualReport: ApiDateTimeUtc // BCOMP only
  noDissolution: boolean
  state: BusinessStateE
  stateFiling: string // the state filing URL
  startDate: ApiDateTimeUtc
  submitter?: string // not used
  taxId?: string // aka Business Number // may be absent
  warnings: Array<BusinessWarningI>
}

export interface FilingTypeI {
  displayName: string
  feeCode: string
  name: FilingTypes
  type?: FilingSubTypeE
}

export enum WarningTypesE {
  COMPLIANCE = 'COMPLIANCE',
  FUTURE_EFFECTIVE_AMALGAMATION = 'FUTURE_EFFECTIVE_AMALGAMATION',
  INVOLUNTARY_DISSOLUTION = 'INVOLUNTARY_DISSOLUTION',
  MISSING_REQUIRED_BUSINESS_INFO = 'MISSING_REQUIRED_BUSINESS_INFO',
  NOT_IN_GOOD_STANDING = 'NOT_IN_GOOD_STANDING'
}

export interface BusinessWarningI {
  code: string // FUTURE: use an enum
  filing?: string // not used
  message: string
  warningType: WarningTypesE
  data?: any // optional extra properties (eg, amalgamationDate)
}
