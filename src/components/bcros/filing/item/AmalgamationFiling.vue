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
        v-else-if="isBootstrapFiling && isFilingStatus(props.filing, FilingStatusE.COMPLETED)"
        data-cy="completed-amalgamation-details"
        class="pt=5"
      >
        <strong>{{ $t('text.filing.amalgamation.complete') }}</strong>

        <p class="my-4">
          {{ currentBusinessName }}&nbsp;{{ $t('text.filing.amalgamation.successfullyAmalgamated') }}.
        </p>

        <p class="my-4">
          {{ $t('text.filing.common.systemCompletedProcessingFiling') }}
        </p>

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

const { isBootstrapFiling } = storeToRefs(useBcrosBusinessBootstrap())
</script>
