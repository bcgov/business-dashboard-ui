<template>
  <BcrosFilingCommonTemplate :filing="filing" data-cy="alteration-filing">
    <template #subtitle>
      <BcrosFilingCommonFiledAndPendingPaid v-if="isFutureEffectivePending" :filing="filing" />
      <BcrosFilingCommonFutureEffectivePaid v-else-if="isFutureEffective" :filing="filing" />
    </template>

    <template #body>
      <!--      todo: add in next ticket #22331 -->
      TBD
      <!--      <FutureEffectivePending-->
      <!--        v-if="isFutureEffectivePending"-->
      <!--        :filing="filing"-->
      <!--      />-->

      <!--      <FutureEffective-->
      <!--        v-else-if="isFutureEffective"-->
      <!--        :filing="filing"-->
      <!--      />-->

      <!--      <div-->
      <!--        v-else-if="isStatusCompleted"-->
      <!--        class="completed-alteration-details"-->
      <!--      >-->
      <!--        <h4>Alteration Complete</h4>-->

      <!--        <p v-if="fromLegalType !== toLegalType">-->
      <!--          {{ getLegalName || 'This company' }} was successfully altered-->
      <!--          from a {{ GetCorpFullDescription(fromLegalType) }}-->
      <!--          to a {{ GetCorpFullDescription(toLegalType) }}-->
      <!--          on-->
      <!--          <DateTooltip :date="effectiveDate" />-->
      <!--          .-->
      <!--        </p>-->

      <!--        <p v-if="courtOrderNumber">-->
      <!--          Court Order Number: {{ courtOrderNumber }}-->
      <!--        </p>-->

      <!--        <p v-if="isArrangement">-->
      <!--          Pursuant to a Plan of Arrangement-->
      <!--        </p>-->
      <!--      </div>-->
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

// todo: see to extract this to common method and simplify both methods are checking some simliar stuff
/** Whether this filing is Future Effective Pending (overdue). */
const isFutureEffectivePending = computed((): boolean => {
  return (
    FilingStatusUtils.isStatusPaid(props.filing) &&
    props.filing.isFutureEffective &&
    new Date(props.filing.effectiveDate) < new Date()
  )
})

/** Whether this filing is Future Effective (not yet completed). */
const isFutureEffective = computed((): boolean => {
  return (
    FilingStatusUtils.isStatusPaid(props.filing) &&
    props.filing.isFutureEffective &&
    new Date(props.filing.effectiveDate) > new Date()
  )
})
// /** Whether this filing is in Complete status. */
// get isStatusCompleted (): boolean {
//   return EnumUtilities.isStatusCompleted(this.filing)
// }
//
//
// /** The completed alteration court order number. */
// get courtOrderNumber (): string {
//   return this.isStatusCompleted
//     ? this.filing.data?.order?.fileNumber
//     : null
// }
//
// /** Whether completed alteration is pursuant to a plan of arrangement. */
// get isArrangement (): boolean {
//   return this.isStatusCompleted
//     ? EnumUtilities.isEffectOfOrderPlanOfArrangement(this.filing.data?.order?.effectOfOrder)
//     : null
// }
//
// /** The completed alteration "from" legal type. */
// get fromLegalType (): CorpTypeCd {
//   return this.filing.data?.alteration?.fromLegalType
// }
//
// /** The completed alteration "to" legal type. */
// get toLegalType (): CorpTypeCd {
//   return this.filing.data?.alteration?.toLegalType
// }
//
// get effectiveDate (): Date {
//   return new Date(this.filing.effectiveDate)
// }

</script>
