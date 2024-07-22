<template>
  <BcrosFilingCommonTemplate
    :filing="filing"
    data-cy="continuation-out"
  >
    <template #body>
      <!--      todo: add in next ticket #22331 -->
      TBD
      <!-- see: -->
      <!-- eslint-disable-next-line max-len -->
      <!-- https://github.com/bcgov/business-filings-ui/blob/main/src/components/Dashboard/FilingHistoryList/filings/ContinuationOut.vue -->
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

</script>
