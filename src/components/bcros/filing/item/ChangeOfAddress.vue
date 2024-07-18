<template>
  <BcrosFilingCommonTemplate :filing="filing" data-cy="change-of-address">
    <template #subtitle>
      <BcrosFilingCommonCoaFiledAndPending v-if="isFutureEffective" :filing="filing" />
    </template>

    <template #body>
      <div v-if="isFutureEffective">
        <!-- no body in this case -->
      </div>
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'
import { isBaseCompany } from '~/utils/company-type'

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const business = useBcrosBusiness()

const isFutureEffective = computed((): boolean => {
  return (
    isBaseCompany(business.currentBusiness.legalType) &&
    props.filing.isFutureEffective &&
    FilingStatusUtils.isStatusPaid(props.filing) &&
    new Date(props.filing.effectiveDate) > new Date()
  )
})

</script>
