import { AuthorizedActionsE } from '../../src/enums/authorized-actions-e'

/**
 * Mock auth actions for testing purposes.
 * This is used to mock the auth actions for unit testing.
 */
export const BusinessRegistryStaffRoles = [
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
  AuthorizedActionsE.OVERRIDE_NIGS,
  AuthorizedActionsE.REGISTRATION_FILING,
  AuthorizedActionsE.RESTORATION_REINSTATEMENT_FILING,
  AuthorizedActionsE.STAFF_BREADCRUMBS,
  AuthorizedActionsE.STAFF_COMMENTS,
  AuthorizedActionsE.STAFF_FILINGS,
  AuthorizedActionsE.TRANSITION_FILING,
  AuthorizedActionsE.VOLUNTARY_DISSOLUTION_FILING
]

/**
 * The roles if the user is Maximus Staff.
 * Ultimately we won't need this list and we'll just check auth roles for everything.
 */
export const MaximusStaffRoles = [
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
export const ContactCentreStaffRoles = [
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
export const SbcFieldOfficeStaffRoles = [
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
export const DefaultRoles = [
  AuthorizedActionsE.ADDRESS_CHANGE_FILING,
  AuthorizedActionsE.AGM_EXTENSION_FILING,
  AuthorizedActionsE.AGM_CHG_LOCATION_FILING,
  AuthorizedActionsE.ALTERATION_FILING,
  AuthorizedActionsE.AMALGAMATION_FILING,
  AuthorizedActionsE.ANNUAL_REPORT_FILING,
  AuthorizedActionsE.CONSENT_AMALGAMATION_OUT_FILING,
  AuthorizedActionsE.CONSENT_CONTINUATION_OUT_FILING,
  AuthorizedActionsE.DIGITAL_CREDENTIALS,
  AuthorizedActionsE.DIRECTOR_CHANGE_FILING,
  AuthorizedActionsE.FIRM_CHANGE_FILING,
  AuthorizedActionsE.REGISTRATION_FILING,
  AuthorizedActionsE.SPECIAL_RESOLUTION_FILING,
  AuthorizedActionsE.VOLUNTARY_DISSOLUTION_FILING
]
