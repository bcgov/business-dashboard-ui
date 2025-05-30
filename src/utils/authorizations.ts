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
  // return account.authRoles.includes(AuthorizationRolesE.SBC_STAFF) // *** TODO: uncomment this after #27536
  return (account.currentAccount?.accountType === AccountTypeE.SBC_STAFF) // *** TODO: delete this after #27536
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
  AuthorizedActionsE.AMALGAMATION_FILING,
  AuthorizedActionsE.ANNUAL_REPORT_FILING,
  AuthorizedActionsE.ALTERATION_FILING,
  AuthorizedActionsE.CONVERSION_FILING,
  AuthorizedActionsE.CONSENT_AMALGAMATION_OUT_FILING,
  AuthorizedActionsE.CONSENT_CONTINUATION_OUT_FILING,
  AuthorizedActionsE.COURT_ORDER_POA,
  AuthorizedActionsE.CORRECTION_FILING,
  AuthorizedActionsE.DETAIL_COMMENTS,
  AuthorizedActionsE.DOCUMENT_RECORDS,
  AuthorizedActionsE.FREEZE_UNFREEZE_FILING,
  AuthorizedActionsE.NO_CONTACT_INFO,
  AuthorizedActionsE.RESTORATION_REINSTATEMENT_FILING,
  AuthorizedActionsE.STAFF_BREADCRUMBS,
  AuthorizedActionsE.STAFF_FILING,
  AuthorizedActionsE.STAFF_COMMENTS,
  AuthorizedActionsE.VOLUNTARY_DISSOLUTION_FILING
]

/**
 * The roles if the user is Maximus Staff.
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
const MaximusStaffRoles = []

/**
 * The roles if the user is Contact Centre Staff.
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
const ContactCentreStaffRoles = []

/**
 * The roles if the user is SBC Field Office Staff (aka SBC Staff Tier 2).
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
const SbcFieldOfficeStaffRoles = []

/**
 * The roles if the user is none of the other types.
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
const DefaultRoles = [
  AuthorizedActionsE.DOCUMENT_RECORDS,
  AuthorizedActionsE.SPECIAL_RESOLUTION_FILING
]
