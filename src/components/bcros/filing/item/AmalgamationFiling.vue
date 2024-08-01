<template>
  <BcrosFilingCommonTemplate :filing="filing" data-cy="amalgamation-filing">
    <template #subtitle>
      <BcrosFilingCommonFiledAndPendingPaid v-if="isFutureEffectivePending(filing)" :filing="filing" />
      <BcrosFilingCommonFutureEffectivePaid v-else-if="isFutureEffective(filing)" :filing="filing" />
    </template>

    <template #body>
      <BcrosFilingCommonFutureEffectivePending v-if="isFutureEffectivePending(filing)" :filing="filing" />
      <BcrosFilingCommonFutureEffective v-else-if="isFutureEffective(filing)" :filing="filing" />

      <div
        v-else-if="!!tempRegNumber && isFilingStatus(props.filing, FilingStatusE.COMPLETED)"
        data-cy="completed-amalgamation-details"
      >
        <strong>{{ $t('text.filing.amalgamation.complete') }}</strong>

        <p>{{ currentBusinessName }}&nbsp;{{ $t('text.filing.amalgamation.successfullyAmalgamated') }}.</p>

        <p>{{ $t('text.filing.amalgamation.systemCompletedProcessing') }}</p>

        <BcrosFilingCommonReloadPageWithBizIdBttn :filing="filing" />
      </div>
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'
import {
  FilingStatusE,
  isFilingStatus,
  isFutureEffective,
  isFutureEffectivePending
} from '#imports'

const { currentBusinessName } = storeToRefs(useBcrosBusiness())

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const tempRegNumber = !!sessionStorage.getItem('TEMP_REG_NUMBER')
</script>
