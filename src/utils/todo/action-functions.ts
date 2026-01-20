/** Functions for the action buttons of a ToDo items. Not including functions for affiliation invitations */

import { FilingTypes } from '@bcrs-shared-components/enums'
import { LDFlags } from '~/enums/ld-flags'

/** Files a new filing (todo item). */
export const doFileNow = (item: TodoItemI) => {
  const business = useBcrosBusiness()
  const { goToEditUI, goToFilingsUI, goToTransitionUI } = useBcrosNavigate()
  switch (item.name) {
    case FilingTypes.ANNUAL_REPORT: {
      // file the subject Annual Report
      const path = `/${business.currentBusiness.identifier}/annual-report`
      const param = { filingId: '0', arFilingYear: item.ARFilingYear.toString() }
      goToFilingsUI(path, param)
      break
    }
    case FilingTypes.CONVERSION: {
      const path = `/${business.currentBusiness.identifier}/conversion`
      goToEditUI(path)
      break
    }
    case FilingTypes.TRANSITION: {
      goToTransitionUI(business.currentBusiness.identifier)
      break
    }
    default:
      console.error('doFileNow(), invalid type for task =', item)
      break
  }
}

/** Redirects to the payment page. This is called for both 'Resume Payment' and 'Retry Payment' action. */
export const doResumePayment = (item: TodoItemI): boolean => {
  const { redirect } = useBcrosNavigate()
  const runtimeConfig = useRuntimeConfig()
  const paymentToken = item.paymentToken
  const baseUrl = `${window.location.origin}${window.location.pathname}`
  const returnUrl = encodeURIComponent(baseUrl + '?filing_id=' + item.filingId)

  redirect(`${runtimeConfig.public.authWebURL}makepayment/${paymentToken}/${returnUrl}`)
  return true
}

/** Resumes a draft filing. */
export const doResumeFiling = (item: TodoItemI): void => {
  const { currentBusinessIdentifier } = useBcrosBusiness()
  const { currentBusiness } = storeToRefs(useBcrosBusiness())
  const { bootstrapIdentifier } = useBcrosBusinessBootstrap()
  const { goToCreateUI, goToEditUI, goToFilingsUI, goToPersonRolesUI } = useBcrosNavigate()
  const { getStoredFlag } = useBcrosLaunchdarkly()

  let navigateFn: Function | undefined
  let path = ''
  let params: { [key: string]: string } | undefined

  switch (item.name) {
    case FilingTypes.ALTERATION:
      // navigate to Edit UI to resume this Alteration
      navigateFn = goToEditUI
      path = `/${currentBusinessIdentifier}/alteration/`
      params = { 'alteration-id': item.filingId.toString() }
      break

    case FilingTypes.AMALGAMATION_APPLICATION:
      // navigate to Create UI to resume this Amalgamation
      navigateFn = goToCreateUI
      params = { id: bootstrapIdentifier }
      break

    case FilingTypes.AMALGAMATION_OUT:
      // navigate to Amalgamation Out page of Filings UI
      if (getStoredFlag(LDFlags.SupportedAmalgamationOutEntities)?.includes(currentBusiness.value.legalType)) {
        navigateFn = goToFilingsUI
        path = `/${currentBusinessIdentifier}/amalgamation-out`
        params = { filingId: item.filingId.toString() }
      }
      break

    case FilingTypes.ANNUAL_REPORT:
      // navigate to the Annual Report page of Filings UI
      navigateFn = goToFilingsUI
      path = `/${currentBusinessIdentifier}/annual-report`
      params = { filingId: item.filingId.toString(), arFilingYear: item.ARFilingYear.toString() }
      break

    case FilingTypes.CHANGE_OF_ADDRESS:
      // navigate to Change of Address page of Filings UI
      navigateFn = goToFilingsUI
      path = `/${currentBusinessIdentifier}/standalone-addresses`
      params = { filingId: item.filingId.toString() }
      break

    case FilingTypes.CHANGE_OF_DIRECTORS:
      // navigate to Change of Directors page of Filings UI
      navigateFn = goToFilingsUI
      path = `/${currentBusinessIdentifier}/standalone-directors`
      params = { filingId: item.filingId.toString() }
      break

    case FilingTypes.CHANGE_OF_OFFICERS:
      // navigate to PeopleRoles UI to resume this officer filing
      navigateFn = goToPersonRolesUI
      path = `officer-change/${currentBusinessIdentifier}/`
      params = { draft: item.filingId.toString() }
      break

    case FilingTypes.CONSENT_AMALGAMATION_OUT:
      // navigate to Consent Amalgamation Out page of Filings UI
      if (getStoredFlag(LDFlags.SupportedConsentAmalgamationOutEntities)?.includes(currentBusiness.value.legalType)) {
        navigateFn = goToFilingsUI
        path = `/${currentBusinessIdentifier}/consent-amalgamation-out`
        params = { filingId: item.filingId.toString() }
      }
      break

    case FilingTypes.CONSENT_CONTINUATION_OUT:
      // navigate to Consent Continuation Out page of Filings UI
      navigateFn = goToFilingsUI
      path = `/${currentBusinessIdentifier}/consent-continuation-out`
      params = { filingId: item.filingId.toString() }
      break

    case FilingTypes.CONTINUATION_IN:
      // navigate to Create UI to resume this Continuation In
      navigateFn = goToCreateUI
      path = '/continuation-in-business-home'
      params = { id: bootstrapIdentifier }
      break

    case FilingTypes.CONTINUATION_OUT:
      // navigate to Continuation Out page of Filings UI
      navigateFn = goToFilingsUI
      path = `/${currentBusinessIdentifier}/continuation-out`
      params = { filingId: item.filingId.toString() }
      break

    case FilingTypes.CORRECTION:
      // nagivate to Edit UI to resume correction
      navigateFn = goToEditUI
      path = `/${currentBusinessIdentifier}/correction/`
      params = { 'correction-id': item.filingId.toString() }
      break

    case FilingTypes.REGISTRATION:
      // navigate to Create UI to resume this Registration
      navigateFn = goToCreateUI
      path = '/define-registration'
      params = { id: bootstrapIdentifier }
      break

    case FilingTypes.CHANGE_OF_REGISTRATION:
      // navigate to Edit UI to resume this Change of Registration
      navigateFn = goToEditUI
      path = `/${currentBusinessIdentifier}/change/`
      params = { 'change-id': item.filingId.toString() }
      break

    case FilingTypes.CONVERSION:
      // navigate to Edit UI to resume this Conversion -- only available for staff account
      navigateFn = goToEditUI
      path = `/${currentBusinessIdentifier}/conversion/`
      params = { 'conversion-id': item.filingId.toString() }
      break

    case FilingTypes.DISSOLUTION:
      // navigate to Create UI to resume this Dissolution
      navigateFn = goToCreateUI
      path = '/define-dissolution'
      params = { id: currentBusinessIdentifier }
      break

    case FilingTypes.INCORPORATION_APPLICATION:
      // navigate to Create UI to resume this Incorporation application
      navigateFn = goToCreateUI
      path = '/incorporation-define-company'
      params = { id: bootstrapIdentifier }
      break

    case FilingTypes.RESTORATION:
      // navigate to Edit UI to resume limited restoration extension filing
      // navigate to Edit UI to resume limited restoration to full filing
      // navigate to Create UI to resume full or limited restoration filing
      if (item.filingSubType === FilingSubTypeE.LIMITED_RESTORATION_EXTENSION) {
        navigateFn = goToEditUI
        path = `/${currentBusinessIdentifier}/limitedRestorationExtension`
        params = { 'restoration-id': item.filingId.toString() }
      } else if (item.filingSubType === FilingSubTypeE.LIMITED_RESTORATION_TO_FULL) {
        navigateFn = goToEditUI
        path = `/${currentBusinessIdentifier}/limitedRestorationToFull`
        params = { 'restoration-id': item.filingId.toString() }
      } else {
        navigateFn = goToCreateUI
        path = '/restoration-business-name'
        params = { id: currentBusinessIdentifier }
      }
      break

    case FilingTypes.SPECIAL_RESOLUTION:
      // navigate to Edit UI to resume this Special Resolution
      navigateFn = goToEditUI
      path = `/${currentBusinessIdentifier}/special-resolution/`
      params = { 'special-resolution-id': item.filingId.toString() }
      break

    case FilingTypes.CHANGE_OF_LIQUIDATORS:
      navigateFn = goToPersonRolesUI
      path = `manage-liquidators/${currentBusinessIdentifier}/${item.subType}`
      params = { draft: item.filingId.toString() }
      break

    case FilingTypes.CHANGE_OF_RECEIVERS:
      navigateFn = goToPersonRolesUI
      path = `manage-receivers/${currentBusinessIdentifier}/${item.subType}`
      params = { draft: item.filingId.toString() }
      break

    default:
      break
  }

  if (navigateFn) {
    navigateFn(path, params)
  } else {
    console.error('doResumeFiling(), invalid filing type =', item)
  }
}

/** Refreshes the current web page. */
export const doRefresh = (): boolean => {
  useBcrosNavigate().refresh()
  return true
}
