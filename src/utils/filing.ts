import { FilingTypes } from '@bcrs-shared-components/enums'

/** Check if the filing is paid */
export const isStatusPaid = (filing: StateFilingHeaderI): boolean => {
  return (filing.status === FilingStatusE.PAID)
}

/** Check if the filing is a Change of Address */
export const isTypeChangeOfAddress = (filing: StateFilingHeaderI): boolean => {
  return (filing.name === FilingTypes.CHANGE_OF_ADDRESS)
}
