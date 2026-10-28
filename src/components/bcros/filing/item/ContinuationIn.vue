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
      <div v-else-if="isStatusRejected" class="flex flex-col gap-3">
        <UDivider class="mt-6" />
        <p class="mt-3">
          <!--  old text -- may need to switch back to this version
          {{ $t('text.general.this') }} {{ filing.displayName }} {{ $t('text.filing.common.isRejectedForReasons') }}:
          -->
          Review the reasons your continuation authorization was rejected below:
        </p>
        <div class="bg-gray-200 py-3 px-5">
          {{ filing.latestReviewComment || `[${$t('text.filing.common.undefinedStaffRejectionMessage')}]` }}
        </div>
        <p>
          <!-- old text
          {{ $t('text.filing.continuation.youWillReceiveRefundWithin10BusinessDays') }}
          -->
          Please submit a new application if you’d like to continue your business into B.C.
        </p>
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

const isStatusRejected = isFilingStatus(props.filing, FilingStatusE.REJECTED)
</script>
