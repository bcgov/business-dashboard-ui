<template>
  <BcrosFilingCommonTemplate
    :filing="filing"
    data-cy="dissolution-voluntary"
  >
    <template #subtitle>
      <BcrosFilingCommonFiledAndPendingPaid v-if="isFutureEffectivePending" :filing="filing" />
      <BcrosFilingCommonFutureEffectivePaid v-else-if="isFutureEffective" :filing="filing" />
    </template>

    <template #body>
      <!--      todo: add in next ticket #22331 -->
      TBD
      <!-- see: -->
      <!-- eslint-disable-next-line max-len -->
      <!-- https://github.com/bcgov/business-filings-ui/blob/main/src/components/Dashboard/FilingHistoryList/filings/DissolutionVoluntary.vue -->
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'
import { FilingStatusE, isFilingStatus } from '#imports'

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

// todo: extract this into common ? its repeated in at least one more filing
/** Whether this filing is Future Effective Pending (overdue). */
const isFutureEffectivePending = computed((): boolean => {
  return (
    isFilingStatus(props.filing, FilingStatusE.PAID) &&
    props.filing.isFutureEffective &&
    new Date(props.filing.effectiveDate) < new Date()
  )
})

/** Whether this filing is Future Effective (not yet completed). */
const isFutureEffective = computed((): boolean => {
  return (
    isFilingStatus(props.filing, FilingStatusE.PAID) &&
    props.filing.isFutureEffective &&
    new Date(props.filing.effectiveDate) > new Date()
  )
})

// todo: add in next ticket #22331
//
// /** Whether this filing is in Complete status. */
// get isStatusCompleted (): boolean {
//   return EnumUtilities.isStatusCompleted(this.filing)
// }
//
// /** The entity title to display. */
// get entityTitle (): string {
//   return this.getDissolutionConfirmationResource?.entityTitle || '[unknown]'
// }
//
// /** The dissolution date to display. */
// get dissolutionDate (): string {
//   const dissolutionDate = this.filing.data?.dissolution?.dissolutionDate
//   const date = DateUtilities.yyyyMmDdToDate(dissolutionDate)
//   return (DateUtilities.dateToPacificDate(date, true) || '[unknown]')
// }
//
// /** The dissolution date-time to display. */
// get dissolutionDateTime (): string {
//   return this.filing.effectiveDate
//     ? DateUtilities.dateToPacificDateTime(new Date(this.filing.effectiveDate))
//     : '[unknown]'
// }
//
// /** The dissolution date-time submitted to display. */
// get dissolutionDateSubmitted (): string {
//   return this.filing.submittedDate
//     ? DateUtilities.dateToPacificDateTime(new Date(this.filing.submittedDate))
//     : '[unknown]'
// }
//
// /** The act title to display. */
// get actTitle (): string {
//   return this.getDissolutionConfirmationResource?.act || '[unknown]'
// }
//
// /** The court order file number. */
// get courtOrderNumber (): string {
//   return this.filing.data?.order?.fileNumber
// }
//
// /** Whether the court order has an effect of order. */
// get hasEffectOfOrder (): boolean {
//   return Boolean(this.filing.data?.order?.effectOfOrder)
// }

</script>
