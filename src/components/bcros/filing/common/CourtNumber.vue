<template>
  <p v-if="fileNumber" class="mt-4 mb-0" data-cy="court-order-number">
    <strong>{{ $t('text.filing.common.courtOrderNumber') }}</strong>: {{ fileNumber }}
  </p>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

/** The court order file number. */
const fileNumber = props.filing.data?.order?.fileNumber
</script>
