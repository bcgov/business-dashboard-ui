//
// Filing Type helpers
//
import { FilingTypes } from '@bcrs-shared-components/enums'
import type { ApiResponseFilingI } from '~/interfaces/filing-i'
import type { StateFilingI } from '~/interfaces/business-i'


export class FilingUtils {
  /** Returns True if filing is an AGM Extension. */
  static isTypeAgmExtension (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.AGM_EXTENSION)
  }

  /** Returns True if filing is an AGM Location Change. */
  static isTypeAgmLocationChange (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.AGM_LOCATION_CHANGE)
  }

  /** Returns True if filing is an Alteration. */
  static isTypeAlteration (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.ALTERATION)
  }

  /** Returns True if filing is an Annual Report. */
  static isTypeAnnualReport (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.ANNUAL_REPORT)
  }

  /** Returns True if filing is a Change of Address. */
  static isTypeChangeOfAddress (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.CHANGE_OF_ADDRESS)
  }

  /** Returns True if filing is a Change of of Company Info. */
  static isTypeChangeOfCompanyInfo (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.CHANGE_OF_COMPANY_INFO)
  }

  /** Returns True if filing is a Change of Directors. */
  static isTypeChangeOfDirectors (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.CHANGE_OF_DIRECTORS)
  }

  /** Returns True if filing is a Change of Name. */
  static isTypeChangeOfName (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.CHANGE_OF_NAME)
  }

  /** Returns True if filing is a Change of Registration. */
  static isTypeChangeOfRegistration (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.CHANGE_OF_REGISTRATION)
  }

  /** Returns True if filing is an Amalgamation Out. */
  static isTypeAmalgamationOut (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.AMALGAMATION_OUT)
  }

  /** Returns True if filing is a Consent for Amalgamation Out. */
  static isTypeConsentAmalgamationOut (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.CONSENT_AMALGAMATION_OUT)
  }

  /** Returns True if filing is a Consent for Continuation Out. */
  static isTypeConsentContinuationOut (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.CONSENT_CONTINUATION_OUT)
  }

  /** Returns True if filing is a Continuation In. */
  static isTypeContinuationIn (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.CONTINUATION_IN)
  }

  /** Returns True if filing is a Continuation Out. */
  static isTypeContinuationOut (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.CONTINUATION_OUT)
  }

  /** Returns True if filing is a Conversion. */
  static isTypeConversion (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.CONVERSION)
  }

  /** Returns True if filing is a Correction. */
  static isTypeCorrection (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.CORRECTION)
  }

  /** Returns True if filing is a Dissolution. */
  static isTypeDissolution (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.DISSOLUTION)
  }

  /** Returns True if filing is a Dissolved. */
  static isTypeDissolved (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.DISSOLVED)
  }

  /** Returns True if filing is an Amalgamation Application. */
  static isTypeAmalgamationApplication (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.AMALGAMATION_APPLICATION)
  }

  /** Returns True if filing is an Incorporation Application. */
  static isTypeIncorporationApplication (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.INCORPORATION_APPLICATION)
  }

  /** Returns True if filing is a Registration. */
  static isTypeRegistration (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.REGISTRATION)
  }

  /** Returns True if filing is a Restoration (of any subtype). */
  static isTypeRestoration (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.RESTORATION)
  }

  /** Returns True if filing is a Transition. */
  static isTypeTransition (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.TRANSITION)
  }

  /** Returns True if filing is a Registrar's Notation. */
  static isTypeRegistrarsNotation (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.REGISTRARS_NOTATION)
  }

  /** Returns True if filing is a Registrar's Order. */
  static isTypeRegistrarsOrder (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.REGISTRARS_ORDER)
  }

  /** Returns True if filing is a Put Back On. */
  static isTypePutBackOn (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.PUT_BACK_ON)
  }

  /** Return True if the filing is an Admin Freeze or Unfreeze. */
  static isTypeAdminFreeze (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.ADMIN_FREEZE)
  }

  /** Returns True if filing is a Court Order. */
  static isTypeCourtOrder (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.COURT_ORDER)
  }

  /** Returns True if filing is a Special Resolution. */
  static isTypeSpecialResolution (filing: ApiResponseFilingI): boolean {
    return (filing.name === FilingTypes.SPECIAL_RESOLUTION)
  }


  /** Returns True if filing is a Regular Amalgamation. */
  static isTypeAmalgamationRegular (filing: ApiResponseFilingI): boolean {
    // the property in a todo item or filing item:
    return filing.filingSubType === FilingSubTypeE.AMALGAMATION_REGULAR
  }

  /** Returns True if filing is a Horizontal Amalgamation. */
  static isTypeAmalgamationHorizontal (filing: ApiResponseFilingI): boolean {
    return (
      // the property in a todo item or filing item:
      filing.filingSubType === FilingSubTypeE.AMALGAMATION_HORIZONTAL
    )
  }

  /** Returns True if filing is a Vertical Amalgamation. */
  static isTypeAmalgamationVertical (filing: ApiResponseFilingI): boolean {
    return (
      // the property in a todo item or filing item:
      filing.filingSubType === FilingSubTypeE.AMALGAMATION_VERTICAL
    )
  }

  /** Returns True if filing is an Administrative Dissolution. */
  static isTypeDissolutionAdministrative (filing: ApiResponseFilingI): boolean {
    return (
      // the property in a todo item or filing item:
      filing.filingSubType === FilingSubTypeE.DISSOLUTION_ADMINISTRATIVE
    )
  }

  /** Returns True if filing is an Involuntary Dissolution. */
  static isTypeDissolutionInvoluntary (filing: ApiResponseFilingI): boolean {
    return (
      // the property in a todo item or filing item:
      filing.filingSubType === FilingSubTypeE.DISSOLUTION_INVOLUNTARY
    )
  }

  /** Returns True if filing is a Voluntary Dissolution. */
  static isTypeDissolutionVoluntary (filing: ApiResponseFilingI): boolean {
    return (
      // the property in a todo item or filing item:
      filing.filingSubType === FilingSubTypeE.DISSOLUTION_VOLUNTARY
    )
  }

  /** Returns True if filing is a Full Restoration. */
  static isTypeRestorationFull (filing: ApiResponseFilingI): boolean {
    return (
      // the property in a todo item or filing item:
      filing.filingSubType === FilingSubTypeE.FULL_RESTORATION
    )
  }

  /** Returns True if filing is a Limited Restoration. */
  static isTypeRestorationLimited (filing: ApiResponseFilingI): boolean {
    return (
      // the property in a todo item or filing item:
      filing.filingSubType === FilingSubTypeE.LIMITED_RESTORATION
    )
  }

  /** Returns True if filing is a Limited Restoration Extension. */
  static isTypeRestorationLimitedExtension (filing: ApiResponseFilingI): boolean {
    return (
      // the property in a todo item or filing item:
      filing.filingSubType === FilingSubTypeE.LIMITED_RESTORATION_EXTENSION
    )
  }

  /** Returns True if filing is a Limited Restoration To Full. */
  static isTypeRestorationLimitedToFull (filing: ApiResponseFilingI): boolean {
    return (
      // the property in a todo item or filing item:
      filing.filingSubType === FilingSubTypeE.LIMITED_RESTORATION_TO_FULL
    )
  }

  /** Returns True if filing is a Staff filing. */
  static isTypeStaff (filing: ApiResponseFilingI): boolean {
    return (
      this.isTypeAdminFreeze(filing) ||
      this.isTypeCourtOrder(filing) ||
      this.isTypeDissolutionAdministrative(filing) ||
      this.isTypePutBackOn(filing) ||
      this.isTypeRegistrarsNotation(filing) ||
      this.isTypeRegistrarsOrder(filing)
    )
  }
}

export class StateFilingUtils {

  /** Returns True if filing is an Administrative Dissolution. */
  static isTypeDissolutionAdministrative (filing: StateFilingI): boolean {
    return (
      // the property in a state filing:
      filing.dissolution?.dissolutionType === FilingSubTypeE.DISSOLUTION_ADMINISTRATIVE
    )
  }

  /** Returns True if filing is an Involuntary Dissolution. */
  static isTypeDissolutionInvoluntary (filing: StateFilingI): boolean {
    return (
      // the property in a state filing:
      filing.dissolution?.dissolutionType === FilingSubTypeE.DISSOLUTION_INVOLUNTARY
    )
  }

  /** Returns True if filing is a Voluntary Dissolution. */
  static isTypeDissolutionVoluntary (filing: StateFilingI): boolean {
    return (
      // the property in a state filing:
      filing.dissolution?.dissolutionType === FilingSubTypeE.DISSOLUTION_VOLUNTARY
    )
  }

  /** Returns True if filing is a Full Restoration. */
  static isTypeRestorationFull (filing: StateFilingI): boolean {
    return (
      // the property in a state filing:
      filing.restoration?.type === FilingSubTypeE.FULL_RESTORATION
    )
  }

  /** Returns True if filing is a Limited Restoration. */
  static isTypeRestorationLimited (filing: StateFilingI): boolean {
    return (
      // the property in a state filing:
      filing.restoration?.type === FilingSubTypeE.LIMITED_RESTORATION
    )
  }

  /** Returns True if filing is a Limited Restoration Extension. */
  static isTypeRestorationLimitedExtension (filing: StateFilingI): boolean {
    return (
      // the property in a state filing:
      filing.restoration?.type === FilingSubTypeE.LIMITED_RESTORATION_EXTENSION
    )
  }

  /** Returns True if filing is a Limited Restoration To Full. */
  static isTypeRestorationLimitedToFull (filing: StateFilingI): boolean {
    return (
      // the property in a state filing:
      filing.restoration?.type === FilingSubTypeE.LIMITED_RESTORATION_TO_FULL
    )
  }

  static isTypeStaff (filing: StateFilingI): boolean {
    return this.isTypeDissolutionAdministrative(filing)
  }
}

export class FilingStatusUtils {
  /** Returns True if item status is Cancelled. */
  static isStatusCancelled (filing: ApiResponseFilingI): boolean {
    return (filing.status === FilingStatusE.CANCELLED)
  }

  /** Returns True if item status is Completed. */
  static isStatusCompleted (filing: ApiResponseFilingI): boolean {
    return (filing.status === FilingStatusE.COMPLETED)
  }

  /** Returns True if item status is Corrected. */
  static isStatusCorrected (filing: ApiResponseFilingI): boolean {
    return (filing.status === FilingStatusE.CORRECTED)
  }

  /** Returns True if item status is Deleted. */
  static isStatusDeleted (filing: ApiResponseFilingI): boolean {
    return (filing.status === FilingStatusE.DELETED)
  }

  /** Returns True if item status is Draft. */
  static isStatusDraft (filing: ApiResponseFilingI): boolean {
    return (filing.status === FilingStatusE.DRAFT)
  }

  /** Returns True if item status is Error. */
  static isStatusError (filing: ApiResponseFilingI): boolean {
    return (filing.status === FilingStatusE.ERROR)
  }

  /** Returns True if item status is New. */
  static isStatusNew (filing: ApiResponseFilingI): boolean {
    return (filing.status === FilingStatusE.NEW)
  }

  /** Returns True if item status is Paid. */
  static isStatusPaid (filing: ApiResponseFilingI): boolean {
    return (filing.status === FilingStatusE.PAID)
  }

  /** Returns True if item status is Pending. */
  static isStatusPending (filing: ApiResponseFilingI): boolean {
    return (filing.status === FilingStatusE.PENDING)
  }

  /** Returns True if item status is Pending-Correction. */
  static isStatusPendingCorrection (filing: ApiResponseFilingI): boolean {
    return (filing.status === FilingStatusE.PENDING_CORRECTION)
  }

  /** Returns True if item status is Withdrawn. */
  static isStatusWithdrawn (filing: ApiResponseFilingI): boolean {
    return (filing.status === FilingStatusE.WITHDRAWN)
  }
}
