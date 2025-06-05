import { FilingTypes } from '@bcrs-shared-components/enums'
import { FilingSubTypeE } from '~/enums/filing-sub-type-e'
import { AuthorizationRolesE } from '~/enums/authorization-roles-e'
import { AuthorizedActionsE } from '~/enums/authorized-actions-e'

/**
 * Whether the specified action is authorized for the current user.
 * Ultimately we'll just check if the auth roles includes the specified action.
 * @returns True or False
 */
export function isAuthorized (action: AuthorizedActionsE): boolean {
  switch (true) {
    case isBusinessRegistryStaff(): return BusinessRegistryStaffRoles.includes(action)
    case isMaximusStaff(): return MaximusStaffRoles.includes(action)
    case isContactCentreStaff(): return ContactCentreStaffRoles.includes(action)
    case isSbcFieldOfficeStaff(): return SbcFieldOfficeStaffRoles.includes(action)
    default: return DefaultRoles.includes(action)
  }
}

/**
 * check the auth roles by filing type
 */
export function isAuthorizedByFilingType (
  filingType: FilingTypes, filingSubType?: FilingSubTypeE | null
): boolean {
  switch (filingType) {
    case FilingTypes.ADMIN_FREEZE: {
      // this covers both Freeze and Unfreeze
      return isAuthorized(AuthorizedActionsE.STAFF_FILINGS)
    }

    case FilingTypes.ALTERATION: {
      return isAuthorized(AuthorizedActionsE.ALTERATION_FILING)
    }

    case FilingTypes.AGM_EXTENSION: {
      return isAuthorized(AuthorizedActionsE.AGM_EXTENSION_FILING)
    }

    case FilingTypes.AGM_LOCATION_CHANGE: {
      return isAuthorized(AuthorizedActionsE.AGM_CHG_LOCATION_FILING)
    }

    case FilingTypes.AMALGAMATION_APPLICATION: {
      return isAuthorized(AuthorizedActionsE.AMALGAMATION_FILING)
    }

    case FilingTypes.AMALGAMATION_OUT: {
      return isAuthorized(AuthorizedActionsE.STAFF_FILINGS)
    }

    case FilingTypes.ANNUAL_REPORT: {
      return isAuthorized(AuthorizedActionsE.ANNUAL_REPORT_FILING)
    }

    case FilingTypes.CHANGE_OF_ADDRESS: {
      return isAuthorized(AuthorizedActionsE.ADDRESS_CHANGE_FILING)
    }

    // case FilingTypes.CHANGE_OF_COMPANY_INFO:   not used here yet

    case FilingTypes.CHANGE_OF_DIRECTORS: {
      return isAuthorized(AuthorizedActionsE.DIRECTOR_CHANGE_FILING)
    }

    // case FilingTypes.CHANGE_OF_NAME:    not used here yet

    case FilingTypes.CHANGE_OF_REGISTRATION: {
      return isAuthorized(AuthorizedActionsE.FIRM_CHANGE_FILING)
    }

    case FilingTypes.CONSENT_AMALGAMATION_OUT: {
      return isAuthorized(AuthorizedActionsE.CONSENT_AMALGAMATION_OUT_FILING)
    }

    case FilingTypes.CONSENT_CONTINUATION_OUT: {
      return isAuthorized(AuthorizedActionsE.CONSENT_CONTINUATION_OUT_FILING)
    }

    // case FilingTypes.CONTINUATION_IN: not used here yet

    case FilingTypes.CONTINUATION_OUT: {
      return isAuthorized(AuthorizedActionsE.STAFF_FILINGS)
    }

    case FilingTypes.CONVERSION: {
      return isAuthorized(AuthorizedActionsE.FIRM_CONVERSION_FILING)
    }

    case FilingTypes.CORRECTION: {
      return isAuthorized(AuthorizedActionsE.CORRECTION_FILING)
    }

    case FilingTypes.COURT_ORDER: {
      return isAuthorized(AuthorizedActionsE.COURT_ORDER_FILING)
    }

    case FilingTypes.DISSOLUTION: {
      if (filingSubType === FilingSubTypeE.DISSOLUTION_ADMINISTRATIVE) {
        return isAuthorized(AuthorizedActionsE.ADMIN_DISSOLUTION_FILING)
      }
      if (filingSubType === FilingSubTypeE.DISSOLUTION_VOLUNTARY) {
        return isAuthorized(AuthorizedActionsE.VOLUNTARY_DISSOLUTION_FILING)
      }
      break
    }

    // case FilingTypes.DISSOLVED:                      not used here yet
    // case FilingTypes.INCORPORATION_APPLICATION:      not used here yet

    case FilingTypes.NOTICE_OF_WITHDRAWAL: {
      return isAuthorized(AuthorizedActionsE.NOTICE_WITHDRAWAL_FILING)
    }

    case FilingTypes.PUT_BACK_ON: {
      return isAuthorized(AuthorizedActionsE.STAFF_FILINGS)
    }

    // case FilingTypes.PUT_BACK_OFF:    not used here yet
    // case FilingTypes.REGISTRATION:    not used here yet

    case FilingTypes.REGISTRARS_NOTATION: {
      return isAuthorized(AuthorizedActionsE.STAFF_FILINGS)
    }

    case FilingTypes.REGISTRARS_ORDER: {
      return isAuthorized(AuthorizedActionsE.STAFF_FILINGS)
    }

    case FilingTypes.RESTORATION: {
      // this covers the sub-types:
      // LIMITED_RESTORATION_TO_FULL, LIMITED_RESTORATION_EXTENSION, FULL_RESTORATION, LIMITED_RESTORATION
      return isAuthorized(AuthorizedActionsE.RESTORATION_REINSTATEMENT_FILING)
    }

    case FilingTypes.SPECIAL_RESOLUTION: {
      return isAuthorized(AuthorizedActionsE.SPECIAL_RESOLUTION_FILING)
    }

    case FilingTypes.TRANSITION: {
      return isAuthorized(AuthorizedActionsE.STAFF_FILINGS)
    }

    default:
      return false // should never happen
  }
}

/**
 * Whether the user is Business Registry Staff.
 * Ultimately we won't need this function and we'll just check auth roles for everything.
 */
function isBusinessRegistryStaff (): boolean {
  const account = useBcrosAccount()
  return account.authRoles?.includes(AuthorizationRolesE.STAFF)
}

/**
 * Whether the user is Maximus Staff.
 * Ultimately we won't need this function and we'll just check auth roles for everything.
 */
function isMaximusStaff (): boolean {
  const account = useBcrosAccount()
  return account.authRoles?.includes(AuthorizationRolesE.MAXIMUS_STAFF)
}

/**
 * Whether the user is Contact Centre Staff.
 * Ultimately we won't need this function and we'll just check auth roles for everything.
 */
function isContactCentreStaff (): boolean {
  const account = useBcrosAccount()
  return account.authRoles?.includes(AuthorizationRolesE.CONTACT_CENTRE_STAFF)
}

/**
 * Whether the user is SBC Field Office Staff.
 * Ultimately we won't need this function and we'll just check auth roles for everything.
 */
function isSbcFieldOfficeStaff (): boolean {
  const account = useBcrosAccount()
  return account.authRoles?.includes(AuthorizationRolesE.SBC_STAFF)
}

/**
 * The roles if the user is Business Registry Staff.
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
const BusinessRegistryStaffRoles = [
  AuthorizedActionsE.ADDRESS_CHANGE_FILING,
  AuthorizedActionsE.ADMIN_DISSOLUTION_FILING,
  AuthorizedActionsE.AGM_EXTENSION_FILING,
  AuthorizedActionsE.AGM_CHG_LOCATION_FILING,
  AuthorizedActionsE.ALTERATION_FILING,
  AuthorizedActionsE.AMALGAMATION_FILING,
  AuthorizedActionsE.ANNUAL_REPORT_FILING,
  AuthorizedActionsE.CONSENT_AMALGAMATION_OUT_FILING,
  AuthorizedActionsE.CONSENT_CONTINUATION_OUT_FILING,
  AuthorizedActionsE.CORRECTION_FILING,
  AuthorizedActionsE.COURT_ORDER_FILING,
  AuthorizedActionsE.DETAIL_COMMENTS,
  AuthorizedActionsE.DIRECTOR_CHANGE_FILING,
  AuthorizedActionsE.DOCUMENT_RECORDS,
  AuthorizedActionsE.FIRM_CHANGE_FILING,
  AuthorizedActionsE.FIRM_CONVERSION_FILING,
  AuthorizedActionsE.NO_CONTACT_INFO,
  AuthorizedActionsE.NOTICE_WITHDRAWAL_FILING,
  AuthorizedActionsE.REGISTRATION_FILING,
  AuthorizedActionsE.RESTORATION_REINSTATEMENT_FILING,
  AuthorizedActionsE.STAFF_BREADCRUMBS,
  AuthorizedActionsE.STAFF_COMMENTS,
  AuthorizedActionsE.STAFF_FILINGS,
  AuthorizedActionsE.VOLUNTARY_DISSOLUTION_FILING
]

/**
 * The roles if the user is Maximus Staff.
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
const MaximusStaffRoles = [
  AuthorizedActionsE.ADDRESS_CHANGE_FILING,
  AuthorizedActionsE.ALTERATION_FILING,
  AuthorizedActionsE.ANNUAL_REPORT_FILING,
  AuthorizedActionsE.DIRECTOR_CHANGE_FILING,
  AuthorizedActionsE.DOCUMENT_RECORDS,
  AuthorizedActionsE.FIRM_CHANGE_FILING,
  AuthorizedActionsE.REGISTRATION_FILING,
  AuthorizedActionsE.VOLUNTARY_DISSOLUTION_FILING
]

/**
 * The roles if the user is Contact Centre Staff.
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
const ContactCentreStaffRoles = [
  AuthorizedActionsE.ADDRESS_CHANGE_FILING,
  AuthorizedActionsE.ALTERATION_FILING,
  AuthorizedActionsE.ANNUAL_REPORT_FILING,
  AuthorizedActionsE.DIRECTOR_CHANGE_FILING,
  AuthorizedActionsE.DOCUMENT_RECORDS,
  AuthorizedActionsE.FIRM_CHANGE_FILING,
  AuthorizedActionsE.REGISTRATION_FILING,
  AuthorizedActionsE.VOLUNTARY_DISSOLUTION_FILING
]

/**
 * The roles if the user is SBC Field Office Staff (aka SBC Staff Tier 2).
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
const SbcFieldOfficeStaffRoles = [
  AuthorizedActionsE.ADDRESS_CHANGE_FILING,
  AuthorizedActionsE.ANNUAL_REPORT_FILING,
  AuthorizedActionsE.DIRECTOR_CHANGE_FILING,
  AuthorizedActionsE.DOCUMENT_RECORDS,
  AuthorizedActionsE.FIRM_CHANGE_FILING,
  AuthorizedActionsE.REGISTRATION_FILING,
  AuthorizedActionsE.STAFF_COMMENTS,
  AuthorizedActionsE.VOLUNTARY_DISSOLUTION_FILING
]

/**
 * The roles if the user is none of the other types.
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
const DefaultRoles = [
  AuthorizedActionsE.ADDRESS_CHANGE_FILING,
  AuthorizedActionsE.AGM_EXTENSION_FILING,
  AuthorizedActionsE.AGM_CHG_LOCATION_FILING,
  AuthorizedActionsE.ALTERATION_FILING,
  AuthorizedActionsE.AMALGAMATION_FILING,
  AuthorizedActionsE.ANNUAL_REPORT_FILING,
  AuthorizedActionsE.CONSENT_AMALGAMATION_OUT_FILING,
  AuthorizedActionsE.CONSENT_CONTINUATION_OUT_FILING,
  AuthorizedActionsE.DIRECTOR_CHANGE_FILING,
  AuthorizedActionsE.FIRM_CHANGE_FILING,
  AuthorizedActionsE.REGISTRATION_FILING,
  AuthorizedActionsE.SPECIAL_RESOLUTION_FILING,
  AuthorizedActionsE.VOLUNTARY_DISSOLUTION_FILING
]
