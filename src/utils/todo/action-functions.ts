/* eslint-disable */

/** Functions for the action buttons of a ToDo items. Not including functions for affiliation invitations */
// TO-DO: implement the dialog in ticket #21352
// TO-DO: implement the action function in ticket #22638

import { FilingTypes } from '@bcrs-shared-components/enums'

/** Files a new filing (todo item). */
export const doFileNow = (item: TodoItemI) => {
  const business = useBcrosBusiness()
  const runtimeConfig = useRuntimeConfig()
  const { redirect } = useBcrosNavigate()
  switch (item.name) {
    case FilingTypes.ANNUAL_REPORT: {
      // file the subject Annual Report

      // TO-DO: the following lines are copied from the old codebase. What does it do ????
      // this.setARFilingYear(item.ARFilingYear)
      // this.setArMinDate(item.arMinDate) // COOP only
      // this.setArMaxDate(item.arMaxDate) // COOP only
      // this.setNextARDate(item.nextArDate) // BEN/BC/CC/ULC and CBEN/C/CCC/CUL only
      // this.$router.push({ name: Routes.ANNUAL_REPORT, params: { filingId: '0' } }) // 0 means "new AR"

      // TO-DO: the redirect is block. Currently, users will be redirected to the old dashboard instead of
      // the annual report filing page
      const url = `${runtimeConfig.public.dashboardOldUrl}/${business.currentBusiness.identifier}/annual-report`
      redirect(url, { filingId: '0' }) // 0 means "new AR"
      break
    }
    case FilingTypes.CONVERSION: {
      const url = `${runtimeConfig.public.editApiURL}/${business.currentBusiness.identifier}/conversion`
      redirect(url)
      break
    }
    default:
      console.error('doFileNow(), invalid type for task =', item)
      break
  }
}

// Redirect to the payment page. This is called for both 'Resume Payment' and 'Retry Payment' action
export const doResumePayment = (item: TodoItemI): boolean => {
  // const paymentToken = item.paymentToken

  // const returnUrl = encodeURIComponent(this.baseUrl + '?filing_id=' + item.filingId)
  // const payUrl = this.getAuthWebUrl + 'makepayment/' + paymentToken + '/' + returnUrl

  // navigate(payUrl)
  console.log('Redirect to payment page')
  return true
}

/** Resume a draft filing. */
export const doResumeFiling = (item: TodoItemI): void => {
  // To be implemented
  console.log('Resume a draft filing')
}
