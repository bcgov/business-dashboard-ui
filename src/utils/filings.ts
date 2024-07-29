import { FilingTypes } from '@bcrs-shared-components/enums'
import { type ApiResponseFilingI, FilingStatusE, type StateFilingI } from '#imports'
import { FilingSubTypeE } from '#imports'

export const isFilingType =
  (filing: ApiResponseFilingI, filingType: FilingTypes = undefined, filingSubtype: FilingSubTypeE = undefined) =>
    (filingSubtype && filing.filingSubType === filingSubtype) || (filingType && filing.name === filingType)

export const isStaffFiling = (filing: ApiResponseFilingI) =>
  isFilingType(filing, FilingTypes.ADMIN_FREEZE) ||
  isFilingType(filing, FilingTypes.COURT_ORDER) ||
  isFilingType(filing, undefined, FilingSubTypeE.DISSOLUTION_ADMINISTRATIVE) ||
  isFilingType(filing, FilingTypes.PUT_BACK_ON) ||
  isFilingType(filing, FilingTypes.REGISTRARS_NOTATION) ||
  isFilingType(filing, FilingTypes.REGISTRARS_ORDER)

export const isDissolutionType = (stateFiling: StateFilingI, filingSubtype: FilingSubTypeE) =>
  stateFiling.dissolution?.dissolutionType === filingSubtype

export const isRestorationType = (stateFiling: StateFilingI, filingSubtype: FilingSubTypeE) =>
  stateFiling.restoration?.type === filingSubtype

export const isFilingStatus = (filing: ApiResponseFilingI, filingStatus: FilingStatusE) =>
  filing.status === filingStatus

export const isFutureEffectiveAndPaid = (filing: ApiResponseFilingI) =>
  isFilingStatus(filing, FilingStatusE.PAID) && filing.isFutureEffective

/** Whether this filing is Future Effective Pending (overdue). */
export const isFutureEffectivePending = (filing: ApiResponseFilingI) =>
  isFutureEffectiveAndPaid(filing) && filing.effectiveDate && new Date(filing.effectiveDate) < new Date()

/** Whether this filing is Future Effective (not yet completed). */
export const isFutureEffective = (filing: ApiResponseFilingI) =>
  isFutureEffectiveAndPaid(filing) && filing.effectiveDate && new Date(filing.effectiveDate ) > new Date()
