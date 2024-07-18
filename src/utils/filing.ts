import { FilingTypes } from '@bcrs-shared-components/enums'

/** Check if the filing is paid */
// To-Do: changed the data type for filing when a ApiResponseFilingI is defined
export const isStatusPaid = (filing: any): boolean => {
  return (filing.status === FilingStatusE.PAID)
}

/** Check if the filing is a Change of Address */
// To-Do: changed the data type for filing when a ApiResponseFilingI is defined
export const isTypeChangeOfAddress = (filing: any): boolean => {
  return (filing.name === FilingTypes.CHANGE_OF_ADDRESS)
}
