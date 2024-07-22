<template>
  <BcrosFilingCommonTemplate :filing="filing" data-cy="consent-continuation-out">
    <template #body>
      <!--      todo: add in next ticket #22331 -->
      TBD
      <!-- see: -->
      <!-- eslint-disable-next-line max-len -->
      <!-- https://github.com/bcgov/business-filings-ui/blob/main/src/components/Dashboard/FilingHistoryList/filings/AmalgamationFiling.vue -->
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
</script>
