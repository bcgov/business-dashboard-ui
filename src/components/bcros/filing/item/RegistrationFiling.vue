<template>
  <BcrosFilingCommonTemplate :filing="filing" data-cy="registration-filing">
    <template #body>
      <div v-if="!!tempRegNumber && isStatusCompleted" class="completed-registration-details">
        <strong>{{ $t('text.filing.registration.completed') }}</strong>

        <p>
          {{ currentBusinessName || 'This company' }}&nbsp;
          {{ $t('text.filing.registration.hasBeenSuccessfullyRegistered') }}
        </p>

        <p>{{ $t('text.filing.common.systemCompletedProcessingFiling') }}</p>

        <BcrosFilingCommonReloadPageWithBizIdBttn :filing="filing" />
      </div>
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import { type ApiResponseFilingI, FilingStatusE, isFilingStatus } from '#imports'

const { currentBusinessName } = storeToRefs(useBcrosBusiness())

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const isStatusCompleted = isFilingStatus(props.filing, FilingStatusE.COMPLETED)
const tempRegNumber = !!sessionStorage.getItem('TEMP_REG_NUMBER')
</script>
