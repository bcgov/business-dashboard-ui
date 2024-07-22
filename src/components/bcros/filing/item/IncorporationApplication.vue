<template>
  <BcrosFilingCommonTemplate
    :filing="filing"
    data-cy="incorporation-application"
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
      <!-- https://github.com/bcgov/business-filings-ui/blob/main/src/components/Dashboard/FilingHistoryList/filings/IncorporationApplication.vue -->
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'
import { FilingStatusE, isFilingStatus } from '#imports'

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

// todo: see to extract this to common method and simplify both methods are checking some simliar stuff
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
</script>
