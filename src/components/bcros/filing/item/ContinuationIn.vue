<template>
  <BcrosFilingCommonTemplate :filing="filing" data-cy="continuation-in">
    <template #subtitle>
      <BcrosFilingCommonFiledAndPendingPaid v-if="isFutureEffectivePending(filing)" :filing="filing" />
      <BcrosFilingCommonFutureEffectivePaid v-else-if="isFutureEffective(filing)" :filing="filing" />
      <BcrosFilingCommonFiledAndRejected v-if="isStatusRejected" :filing="filing" />
    </template>

    <template #body>
      <BcrosFilingCommonFutureEffectivePending v-if="isFutureEffectivePending(filing)" :filing="filing" />
      <BcrosFilingCommonFutureEffective v-else-if="isFutureEffective(filing)" :filing="filing" />

      <!-- rejected bootstrap filing -->
      <div v-else-if="isStatusRejected" class="rejected-continuation-in-details">
        <p class="mt-0">
          {{ $t('text.general.this') }} {{ filing.displayName }} {{ $t('text.filing.common.isRejectedForReasons') }}:
        </p>
        <p>{{ filing.latestReviewComment || `[${$t('text.filing.common.undefinedStaffRejectionMessage')}]` }} </p>
        <p>{{ $t('text.filing.continuation.youWillReceiveRefundWithin10BusinessDays') }}</p>
      </div>

      <!-- completed bootstrap filing -->
      <div v-else-if="!!tempRegNumber && isStatusCompleted" class="completed-continuation-in-details">
        <strong>{{ $t('text.filing.continuation.incorporationComplete') }}</strong>
        <p>{{ currentBusinessName }} {{ $t('text.filing.continuation.hasBeenSuccessfullyContinuedIn') }}</p>
        <p>{{ $t('text.filing.common.systemCompletedProcessingFiling') }}</p>

        <BcrosFilingCommonReloadPageWithBizIdBttn :filing="filing" />
      </div>
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'
import { FilingStatusE, isFilingStatus } from '#imports'

const { currentBusinessName } = storeToRefs(useBcrosBusiness())

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const isStatusRejected = isFilingStatus(props.filing, FilingStatusE.REJECTED)
const isStatusCompleted = isFilingStatus(props.filing, FilingStatusE.COMPLETED)
const tempRegNumber = !!sessionStorage.getItem('TEMP_REG_NUMBER')
</script>
