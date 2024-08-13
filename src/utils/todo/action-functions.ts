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

/** Delete a draft; if refreshDashboard is set to true, refresh the page to reload data */
export const doDeleteDraft = async (item: TodoItemI, refreshDashboard = true): Promise<void> => {
  // const id = this.getIdentifier || this.tempRegNumber
  // const url = `businesses/${id}/filings/${item.filingId}`

  // await axios.delete(url).then(res => {
  //   if (!res) {
  //     throw new Error('Invalid API response')
  //   }

  //   if (refreshDashboard) {
  //     // emit event to reload all data
  //     this.$root.$emit('reloadData')
  //   }
  // }).catch(error => {
  //   if (error?.response) {
  //     if (error.response.data?.errors) {
  //       this.deleteErrors = error.response.data.errors
  //     }
  //     if (error.response.data?.warnings) {
  //       this.deleteWarnings = error.response.data.warnings
  //     }
  //     this.deleteErrorDialog = true
  //   } else {
  //     this.deleteErrorDialog = true
  //   }
  // })
  console.log('Delete a draft and reload the data if needed')
}

/** Open confirmation dialog for confirming draft deletion */
export const confirmDeleteDraft = (item: TodoItemI): void => {
  // // open confirmation dialog and wait for response
  // this.$refs.confirm.open(
  //   'Delete Draft?',
  //   'Delete your ' + item.draftTitle + '? Any changes you\'ve made will be lost.',
  //   {
  //     width: '40rem',
  //     persistent: true,
  //     yes: 'Delete',
  //     no: null,
  //     cancel: 'Cancel'
  //   }
  // ).then(async (confirm) => {
  //   // if we get here, Delete was clicked
  //   if (confirm) {
  //     await this.doDeleteDraft(item)
  //   } else {
  //     // do nothing
  //   }
  // }).catch(() => {
  //   // if we get here, Don't Delete was clicked - do nothing
  // })
  console.log('Open confirmation dialog for confirming draft deletion')
  doDeleteDraft(item)
}

/** Resume a draft filing. */
export const doResumeFiling = (item: TodoItemI): void => {
  // To be implemented
  console.log('Resume a draft filing')
}

/** Delete an application */
export const confirmDeleteApplication = (item: TodoItemI): void => {
  // To be implemented
  console.log('Delete an application')
}

/** Open confirmation dialog for cancelling payment; cancel the payment and set filing status to draft */
export const confirmCancelPayment = (item: TodoItemI): void =>  {
  // // open confirmation dialog and wait for response
  // this.$refs.confirm.open(
  //   'Cancel Payment?',
  //   'Cancel payment for your ' + item.draftTitle + '?',
  //   {
  //     width: '40rem',
  //     persistent: true,
  //     yes: 'Cancel Payment',
  //     no: null,
  //     cancel: 'Don\'t Cancel'
  //   }
  // ).then(async (confirm) => {
  //   // if we get here, Yes or No was clicked
  //   if (confirm) {
  //     await this.cancelPaymentAndSetToDraft(item)
  //   } else {
  //     // do nothing
  //   }
  // }).catch(() => {
  //   // if we get here, Cancel was clicked - do nothing
  // })
  console.log('Open confirmation dialog for cancelling payment')
}

/** Cancel the payment and set the filing status to draft; reload the page */
export const cancelPaymentAndSetToDraft = async (item: TodoItemI): Promise<void> => {
  //   const url = `businesses/${this.getIdentifier}/filings/${item.filingId}`

  //   await axios.patch(url, {}).then(res => {
  //     if (!res) {
  //       throw new Error('Invalid API response')
  //     }

  //     // emit event to reload all data
  //     this.$root.$emit('reloadData')
  //   }).catch(error => {
  //     if (error?.response) {
  //       if (error.response.data?.errors) {
  //         this.cancelPaymentErrors = error.response.data.errors
  //       }
  //       this.cancelPaymentErrorDialog = true
  //     } else {
  //       this.cancelPaymentErrorDialog = true
  //     }
  //   })
  console.log('Cancel the payment and set the filing status to draft')
}
