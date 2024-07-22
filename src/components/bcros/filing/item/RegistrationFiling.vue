<template>
  <BcrosFilingCommonTemplate
    :filing="filing"
    data-cy="registration-filing"
  >
    <template #body>
      <!--      todo: add in next ticket #22331 -->
      tbd
      <!-- see: -->
      <!-- https://github.com/bcgov/business-filings-ui/blob/main/src/components/Dashboard/FilingHistoryList/filings/RegistrationFiling.vue -->
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
</script>
