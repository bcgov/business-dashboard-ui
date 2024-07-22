<template>
  <BcrosFilingCommonTemplate :filing="filing" data-cy="change-of-address">
    <template #subtitle>
      <BcrosFilingCommonFiledAndPendingCOA v-if="isFutureEffective" :filing="filing" />
    </template>

    <template #body>
      <div v-if="isFutureEffective">
        <!-- no body in this case -->
      </div>
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'
import { FilingStatusE, isFilingStatus } from '#imports'

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const business = useBcrosBusiness()

const isFutureEffective = computed((): boolean => {
  return (
    business.isBaseCompany() &&
    props.filing.isFutureEffective &&
    isFilingStatus(props.filing, FilingStatusE.PAID) &&
    new Date(props.filing.effectiveDate) > new Date()
  )
})

</script>
