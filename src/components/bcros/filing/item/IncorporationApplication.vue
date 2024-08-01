<template>
  <BcrosFilingCommonTemplate
    :filing="filing"
    data-cy="incorporation-application"
  >
    <template #subtitle>
      <BcrosFilingCommonFiledAndPendingPaid v-if="isFutureEffectivePending(filing)" :filing="filing" />
      <BcrosFilingCommonFutureEffectivePaid v-else-if="isFutureEffective(filing)" :filing="filing" />
    </template>

    <template #body>
      <BcrosFilingCommonFutureEffectivePending v-if="isFutureEffectivePending(filing)" :filing="filing" />
      <BcrosFilingCommonFutureEffective v-else-if="isFutureEffective(filing)" :filing="filing" />
      <div v-else-if="!!tempRegNumber && isStatusCompleted" data-cy="completed-ia-details">
        <strong>{{ $t('text.filing.incorporationApplication.completed') }}</strong>

        <p>
          {{ currentBusinessName }}&nbsp;
          {{ $t('text.filing.common.hasBeenSuccessfullyIncorporated') }}.
        </p>

        <p>{{ $t('text.filing.incorporationApplication.systemCompletedProcessingFiling') }}.</p>

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

const isStatusCompleted = isFilingStatus(props.filing, FilingStatusE.COMPLETED)
const tempRegNumber = !!sessionStorage.getItem('TEMP_REG_NUMBER')
</script>
