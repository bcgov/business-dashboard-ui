<template>
  <BcrosFilingCommonTemplate :filing="filing" data-cy="change-of-address">
    <template #subtitle>
      <BcrosFilingCommonFiledAndPendingCoa v-if="isFutureEffective" :filing="filing" />
    </template>

    <template #body>
      <BcrosFilingCommonFutureEffective v-if="isFutureEffective" :filing="filing" />
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'
import { FilingStatusE, isFilingStatus } from '#imports'

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const { isBaseCompany } = storeToRefs(useBcrosBusiness())

const isFutureEffective = computed((): boolean => {
  return (
    isBaseCompany.value &&
    props.filing.isFutureEffective &&
    isFilingStatus(props.filing, FilingStatusE.PAID) &&
    new Date(props.filing.effectiveDate) > new Date()
  )
})

</script>
