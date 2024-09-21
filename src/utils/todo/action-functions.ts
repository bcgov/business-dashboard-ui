/** Functions for the action buttons of a ToDo items. Not including functions for affiliation invitations */

import { FilingTypes } from '@bcrs-shared-components/enums'

/** Files a new filing (todo item). */
export const doFileNow = (item: TodoItemI) => {
  const business = useBcrosBusiness()
  const { goToBusinessDashboard, goToEditPage } = useBcrosNavigate()
  switch (item.name) {
    case FilingTypes.ANNUAL_REPORT: {
      // file the subject Annual Report
      const path = `/${business.currentBusiness.identifier}/annual-report`
      const param = { filingId: '0', arFilingYear: item.ARFilingYear.toString() }
      goToBusinessDashboard(path, param)
      break
    }
    case FilingTypes.CONVERSION: {
      const path = `/${business.currentBusiness.identifier}/conversion`
      goToEditPage(path)
      break
    }
    default:
      console.error('doFileNow(), invalid type for task =', item)
      break
  }
}

// Redirect to the payment page. This is called for both 'Resume Payment' and 'Retry Payment' action
export const doResumePayment = (item: TodoItemI): boolean => {
  const { redirect } = useBcrosNavigate()
  const runtimeConfig = useRuntimeConfig()
  const paymentToken = item.paymentToken
  const baseUrl = `${window.location.origin}${window.location.pathname}`
  const returnUrl = encodeURIComponent(baseUrl + '?filing_id=' + item.filingId)

  redirect(`${runtimeConfig.public.authWebURL}makepayment/${paymentToken}/${returnUrl}`)
  return true
}

/** Resume a draft filing. */
export const doResumeFiling = (item: TodoItemI): void => {
  const { currentBusinessIdentifier } = useBcrosBusiness()
  const { bootstrapIdentifier } = useBcrosBusinessBootstrap()
  const { goToBusinessDashboard, goToCreatePage, goToEditPage } = useBcrosNavigate()

  let navigateFn: Function | undefined
  let path = ''
  let params: { [key: string]: string } | undefined

  switch (item.name) {
    case FilingTypes.AMALGAMATION_APPLICATION:
      // navigate to Create UI to resume this Amalgamation
      navigateFn = goToCreatePage
      params = { id: bootstrapIdentifier }
      break

    case FilingTypes.ANNUAL_REPORT:
      // navigate to the Annual Report page of the old dashboard
      navigateFn = goToBusinessDashboard
      path = `/${currentBusinessIdentifier}/annual-report`
      params = { filingId: item.filingId.toString(), arFilingYear: item.ARFilingYear.toString() }
      break

    case FilingTypes.CHANGE_OF_DIRECTORS:
      // navigate to Change of Directors page of the old dashboard
      navigateFn = goToBusinessDashboard
      path = `/${currentBusinessIdentifier}/standalone-directors`
      params = { filingId: item.filingId.toString() }
      break

    case FilingTypes.CHANGE_OF_ADDRESS:
      // navigate to Change of Address page of the old dashboard
      navigateFn = goToBusinessDashboard
      path = `/${currentBusinessIdentifier}/standalone-addresses`
      params = { filingId: item.filingId.toString() }
      break

    case FilingTypes.CONSENT_CONTINUATION_OUT:
      // navigate to Consent Continuation Out page of the old dashboard
      navigateFn = goToBusinessDashboard
      path = `/${currentBusinessIdentifier}/consent-continuation-out`
      params = { filingId: item.filingId.toString() }
      break

    case FilingTypes.CONTINUATION_IN:
      // navigate to Create UI to resume this Continuation In
      navigateFn = goToCreatePage
      path = '/continuation-in-business-home'
      params = { id: bootstrapIdentifier }
      break

    case FilingTypes.CONTINUATION_OUT:
      // navigate to Continuation Out page of the old dashboard
      navigateFn = goToBusinessDashboard
      path = `/${currentBusinessIdentifier}/continuation-out`
      params = { filingId: item.filingId.toString() }
      break

    case FilingTypes.CORRECTION:
      // nagivate to Edit UI to resume correction
      navigateFn = goToEditPage
      path = `/${currentBusinessIdentifier}/correction/`
      params = { 'correction-id': item.filingId.toString() }
      break

    case FilingTypes.INCORPORATION_APPLICATION:
      // navigate to Create UI to resume this Incorporation application
      navigateFn = goToCreatePage
      path = '/incorporation-define-company'
      params = { id: bootstrapIdentifier }
      break

    case FilingTypes.REGISTRATION:
      // navigate to Create UI to resume this Registration
      navigateFn = goToCreatePage
      path = 'define-registration'
      params = { id: bootstrapIdentifier }
      break

    case FilingTypes.ALTERATION:
      // navigate to Edit UI to resume this Alteration
      navigateFn = goToEditPage
      path = `/${currentBusinessIdentifier}/alteration/`
      params = { 'alteration-id': item.filingId.toString() }
      break

    case FilingTypes.DISSOLUTION:
      // navigate to Create UI to resume this Dissolution
      navigateFn = goToCreatePage
      path = '/define-dissolution'
      params = { id: bootstrapIdentifier }
      break

    case FilingTypes.CHANGE_OF_REGISTRATION:
      // navigate to Edit UI to resume this Change of Registration
      navigateFn = goToEditPage
      path = `/${currentBusinessIdentifier}/change/`
      params = { 'change-id': item.filingId.toString() }
      break

    case FilingTypes.CONVERSION:
      // navigate to Edit UI to resume this Conversion -- only available for staff account
      navigateFn = goToEditPage
      path = `/${currentBusinessIdentifier}/conversion/`
      params = { 'conversion-id': item.filingId.toString() }
      break

    case FilingTypes.SPECIAL_RESOLUTION:
      // navigate to Edit UI to resume this Special Resolution
      navigateFn = goToEditPage
      path = `/${currentBusinessIdentifier}/special-resolution/`
      params = { 'special-resolution': item.filingId.toString() }
      break

    case FilingTypes.RESTORATION:
      if ([FilingSubTypeE.FULL_RESTORATION, FilingSubTypeE.LIMITED_RESTORATION].includes(item.filingSubType)) {
        // navigate to Create UI
        navigateFn = goToCreatePage
        params = { id: currentBusinessIdentifier }
      } else if ([FilingSubTypeE.LIMITED_RESTORATION_EXTENSION, FilingSubTypeE.LIMITED_RESTORATION_TO_FULL]
        .includes(item.filingSubType)) {
        // navigate to Edit UI
        navigateFn = goToEditPage
        path = `/${currentBusinessIdentifier}/${item.filingSubType}`
        params = { 'restoration-id': item.filingId.toString() }
      }
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
