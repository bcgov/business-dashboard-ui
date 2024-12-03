import { getName } from 'country-list'

import type { NrApplicantIF } from '@bcrs-shared-components/interfaces'
import { NrRequestActionCodes } from '@bcrs-shared-components/enums'
import type { NameRequestI } from '#imports'
import { NrConsentFlagE } from '~/enums/name-request-consent-flag-e'

export const getApplicantName = (applicant: NrApplicantIF): string => {
  const firstName = applicant?.firstName ? applicant.firstName + ' ' : ''
  const middleName = applicant?.middleName ? applicant.middleName + ' ' : ''
  return `${firstName}${middleName}${applicant?.lastName || ''}`
}

export const getApplicantAddress = (applicant: NrApplicantIF): string => {
  const city = applicant?.city
  const stateProvince = applicant?.stateProvinceCd
  const postal = applicant?.postalCd
  const country = applicant?.countryTypeCd ? getName(applicant?.countryTypeCd) : ''

  // Build address lines
  let address = applicant?.addrLine1
  if (applicant?.addrLine2) {
    address = `${address}, ${applicant?.addrLine2}`
  }
  if (applicant?.addrLine3) {
    address = `${address}, ${applicant?.addrLine3}`
  }

  return `${address}, ${city}, ${stateProvince}, ${postal}, ${country}`
}

/** Returns the Name Request's approved name (or undefined or null if not found). */
export const getNrApprovedName = (nameRequest: NameRequestI): string => {
  if (nameRequest?.names?.length > 0) {
    return nameRequest.names
      .find(name => [NameRequestStateE.APPROVED, NameRequestStateE.CONDITION].includes(name.state))?.name
  }
  return null // should never happen
}

/** Returns error message if the Name Request data is invalid. */
export const isNrInvalid = (nameRequest: NameRequestI): string => {
  if (!nameRequest) { return 'Invalid NR object' }
  if (!nameRequest.applicants) { return 'Invalid NR applicants' }
  if (!nameRequest.expirationDate) { return 'Invalid NR expiration date' }
  if (!nameRequest.legalType) { return 'Invalid NR legal type' }
  if (!getNrApprovedName(nameRequest)) { return 'Invalid NR approved name' }
  if (!nameRequest.nrNum) { return 'Invalid NR number' }
  if (
    nameRequest.request_action_cd !== NrRequestActionCodes.NEW_BUSINESS &&
    nameRequest.request_action_cd !== NrRequestActionCodes.AMALGAMATE &&
    nameRequest.request_action_cd !== NrRequestActionCodes.MOVE
  ) { return 'Invalid NR action code' }
  if (!nameRequest.state) { return 'Invalid NR state' }
  return null
}

/** Returns the Name Request's state */
export const getNrState = (nameRequest: NameRequestI): NameRequestStateE => {
  // Ensure a NR payload is provided.
  if (!nameRequest) { return null }

  // If the NR is awaiting consent, it is not consumable.
  // null = consent not required
  // R = consent received
  // N = consent waived
  // Y = consent required
  if (nameRequest.state === NameRequestStateE.CONDITIONAL &&
    nameRequest.consentFlag !== null && nameRequest.consentFlag !== 'R' && nameRequest.consentFlag !== 'N') {
    return NameRequestStateE.NEED_CONSENT
  }

  // If the NR's root state is not APPROVED / CONDITIONAL / EXPIRED / CONSUMED, it is not consumable.
  if (![NameRequestStateE.APPROVED, NameRequestStateE.CONDITIONAL,
    NameRequestStateE.EXPIRED, NameRequestStateE.CONSUMED].includes(nameRequest.state)) {
    return NameRequestStateE.NOT_APPROVED
  }

  // Otherwise, the NR is consumable.
  return nameRequest.state // APPROVED or CONDITIONAL or CONSUMED or EXPIRED
}

export const getNrRequestType = (nameRequest?: NameRequestI): string => {
  switch (nameRequest?.request_action_cd) {
    case NrRequestActionCodes.NEW_BUSINESS:
      return 'New Business'
    case NrRequestActionCodes.RESTORE:
      return 'Restoration Request'
    case NrRequestActionCodes.AMALGAMATE:
      return 'Amalgamation'
    case NrRequestActionCodes.MOVE:
      return 'Continuation In'
  }
  return '' // should never happen if name request is passed in
}

/** The condition/consent string. */
export const getNrConditionConsent = (nameRequest: NameRequestI): string => {
  if (!nameRequest || nameRequest.state === NameRequestStateE.APPROVED) {
    return NrConsentFlagE.NOT_REQUIRED_STATE
  }
  if (nameRequest.consentFlag === null) {
    return NrConsentFlagE.NOT_REQUIRED_STATE
  }
  if (nameRequest.consentFlag === 'R') {
    return NrConsentFlagE.RECEIVED_STATE
  }
  if (nameRequest.consentFlag === 'N') {
    return NrConsentFlagE.WAIVED_STATE
  }
  return NrConsentFlagE.NOT_RECEIVED_STATE
}

function expiresText (nameRequest: any): string {
  const date = apiToDate(nameRequest.expirationDate)
  const expireDays = daysBetweenTwoDates(new Date(), date)

  // NB: 0 means NR expires today
  if (isNaN(expireDays) || expireDays < 0) {
    return 'Expired'
  } else if (expireDays < 1) {
    return 'Expires today'
  } else if (expireDays < 2) {
    return 'Expires tomorrow'
  } else {
    return `Expires in ${expireDays} days`
  }
}

export const nrSubtitle = (nameRequest: NameRequestI): string => {
  return `Name Request APPROVED - ${expiresText(nameRequest)}`
}
