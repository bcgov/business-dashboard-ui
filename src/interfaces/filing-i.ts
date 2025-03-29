import { AmalgamationTypes, CorpTypeCd, FilingTypes } from '@bcrs-shared-components/enums'
import type {
  ApiDateTimeUtc,
  CommentIF,
  FormattedDateTimeGmt,
  IsoDatePacific,
  SpecialResolutionIF
} from '@bcrs-shared-components/interfaces'
import type { DocumentI, EffectOfOrderTypeE, FilingStatusE, FilingSubTypeE } from '#imports'

/** Filing interface (local item) */
export interface FilingI {
  header: {
    name: FilingTypes
    certifiedBy: string
    date: string
    effectiveDate?: string
    filingId?: number
    folioNumber?: string
    isFutureEffective: boolean

    // staff payment properties:
    routingSlipNumber?: string
    bcolAccountNumber?: string
    datNumber?: string
    waiveFees?: boolean
    priority?: boolean
  }
  business: {
    legalType: CorpTypeCd
    identifier: string
  }
}

/**
 * A filing object from the Legal API ("filings" call). This is the newer response with extra metadata
 * instead of separate business / documents / header / filing objects.
 * This object is also what the Filings History List uses directly.
 */
// todo: fixme: maybe create additional interface that will have GMT times converted into ISO UTC datetime
// see effectiveDate and submittedDate bellow
// or, even better create/update existing endpoint that would return ISO UTC dates
export interface ApiResponseFilingI {
  availableOnPaperOnly: boolean
  businessIdentifier: string
  commentsCount: number
  commentsLink: string // URL to fetch this filing's comments
  displayName: string
  displayLedger: boolean // whether to display this ledger item
  documentsLink: string // URL to fetch this filing's documents
  // effectiveDate: ApiDateTimeUtc
  effectiveDate: FormattedDateTimeGmt,
  filingId: number
  filingLink: string // URL to fetch this filing
  filingSubType?: FilingSubTypeE
  isFutureEffective: boolean
  name: FilingTypes
  status: FilingStatusE
  // submittedDate: ApiDateTimeUtc,
  submittedDate: FormattedDateTimeGmt,
  submitter: string
  withdrawalPending: boolean

  // correction filings only
  correctedFilingId?: string // ID of filing this filing corrects
  correctedLink?: string // URL to fetch filing this filing corrects

  // corrected filings only
  correctionFilingId?: string // ID of this filing's correction
  correctionLink?: string // URL to fetch this filing's correction

  // continuation in filings only // copied it on 2024-07-25
  latestReviewComment?: string

  // filing-specific data (not always present)
  data?: {
    applicationDate: ApiDateTimeUtc
    legalFilings: Array<string>
    withdrawnDate?: ApiDateTimeUtc

    // admin freeze filings only
    adminFreeze?: {
      freeze: boolean
    }

    agmExtension?: {
      year: string // YYYY-MM-DD
      isFirstAgm: boolean
      prevAgmRefDate: string // YYYY-MM-DD
      extReqForAgmYear: boolean
      expireDateCurrExt: string // YYYY-MM-DD
      totalApprovedExt: number // in months
      extensionDuration: number // in months
      expireDateApprovedExt: string // YYYY-MM-DD
    }

    agmLocationChange?: {
      year: string
      reason: string
      agmLocation: string
    }

    // alteration filings only
    alteration?: {
      fromLegalType?: CorpTypeCd
      toLegalType?: CorpTypeCd
    }

    amalgamationApplication?: {
      type: AmalgamationTypes
    }

    // amalgamation out filings only
    amalgamationOut?: {
      amalgamationOutDate: IsoDatePacific
      courtOrder?: any
      country: string
      details?: string
      legalName: string
      region: string // may be null
    }

    // AR filings only
    annualReport?: {
      annualGeneralMeetingDate: IsoDatePacific
      annualReportDate: IsoDatePacific
      annualReportFilingYear?: number
    }

    // COA filings only
    changeOfAddress?: any // some object

    // COD filings only
    changeOfDirectors?: any // some object

    // consent to amalgamation out filings only
    consentAmalgamationOut?: {
      country: string
      expiry: IsoDatePacific
      region: string // may be null
    }

    // consent to continuation out filings only
    consentContinuationOut?: {
      country: string
      expiry: IsoDatePacific
      region: string // may be null
    }

    // continuation in filings only
    continuationIn?: any // some object

    // continuation out filings only
    continuationOut?: {
      continuationOutDate: IsoDatePacific
      courtOrder?: any
      country: string
      details?: string
      legalName: string
      region: string // may be null
    }

    // conversion filings only
    conversion?: any // some object

    // staff filings and others (eg, consent cont out)
    order?: {
      effectOfOrder?: EffectOfOrderTypeE
      fileNumber: string // may be null
      orderDate?: string // FUTURE: use date type here
      orderDetails?: string
    }

    // dissolution filings only
    dissolution?: {
      custodialOffice?: any // FUTURE: use a proper address type here
      dissolutionDate: IsoDatePacific
      dissolutionType: FilingSubTypeE
    }

    // IA filings only
    incorporationApplication?: any // some object

    // registrar's notation filings only
    registrarsNotation?: any // some object

    // registrar's order filings only
    registrarsOrder?: any // some object

    // restorations filings only
    restoration?: {
      expiry: IsoDatePacific,
      toLegalName: string
    }

    putBackOff?: {
      expiryDate: string // YYYY-MM-DD
      reason: string
    }

    // special resolution filings only
    specialResolution?: SpecialResolutionIF

    // transition filings only
    transition?: any // some object
  }

  // properties added by the UI
  comments?: Array<CommentIF>
  documents?: Array<DocumentI>
}
