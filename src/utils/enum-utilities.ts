import { FilingTypes } from '@bcrs-shared-components/enums'

// NB: These two methods are just for getPnedingCoa() in useBcrosFilings store
// more methods to be added. Or the EnumUtilities class can be replaced by functions
export default class EnumUtilities {
  /** Returns True if item status is Paid. */
  static isStatusPaid (item: any): boolean {
    return (item.status === FilingStatusE.PAID)
  }

  /** Returns True if filing is a Change of Address. */
  static isTypeChangeOfAddress (item: any): boolean {
    return (item.name === FilingTypes.CHANGE_OF_ADDRESS)
  }
}
