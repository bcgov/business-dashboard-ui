import { FilingTypes } from '@bcrs-shared-components/enums'
import { FilingSubTypeE } from '~/enums/filing-sub-type-e'
import { AuthorizedActionsE } from '~/enums/authorized-actions-e'

/**
 * Whether the specified action (aka permission) is authorized for the current user.
 * @returns True or False
 */
export function isAuthorized (action: AuthorizedActionsE): boolean {
  const store = useBcrosAccount()
  return store.getAuthorizedActions().includes(action)
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

    case FilingTypes.CHANGE_OF_LIQUIDATORS:
    case FilingTypes.CHANGE_OF_RECEIVERS: {
      return isAuthorized(AuthorizedActionsE.STAFF_FILINGS)
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
      if (filingSubType === FilingSubTypeE.DISSOLUTION_DELAY) {
        return isAuthorized(AuthorizedActionsE.DELAY_DISSOLUTION_FILING)
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
      return isAuthorized(AuthorizedActionsE.TRANSITION_FILING)
    }

    default:
      return false // should never happen
  }
}
