<template>
  <BcrosFilingCommonTemplate :filing="filing" data-cy="registration-filing">
    <template #body>
      {{ bootstrapName }}
      <div v-if="isBootstrapFiling && isStatusCompleted" class="pt-5">
        <strong>{{ $t('text.filing.registration.completed') }}</strong>

        <p class="my-4">
          {{ currentBusinessName || bootstrapName || 'This company' }}&nbsp;
          {{ $t('text.filing.registration.hasBeenSuccessfullyRegistered') }}
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
import { type ApiResponseFilingI, FilingStatusE, isFilingStatus } from '#imports'

const { currentBusinessName } = storeToRefs(useBcrosBusiness())

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const isStatusCompleted = isFilingStatus(props.filing, FilingStatusE.COMPLETED)
const { isBootstrapFiling, bootstrapName } = storeToRefs(useBcrosBusinessBootstrap())
</script>
