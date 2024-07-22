<template>
  <BcrosFilingCommonTemplate
    :filing="filing"
    data-cy="limited-restoration-extension"
  >
    <template #body>
      <!--      todo: add in next ticket #22331 -->
      TBD
      <!-- see: -->
      <!-- https://github.com/bcgov/business-filings-ui/blob/main/src/components/Dashboard/FilingHistoryList/filings/LimitedRestorationExtension.vue -->
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
</script>
