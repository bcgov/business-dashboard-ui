<template>
  <BcrosFilingCommonTemplate data-cy="agm-extension" :filing="filing">
    <template #body>
      <!--      todo: add in next ticket #22331 -->
      TBD
      <!-- see: -->
      <!-- eslint-disable-next-line max-len -->
      <!-- https://github.com/bcgov/business-filings-ui/blob/main/src/components/Dashboard/FilingHistoryList/filings/AgmExtension.vue -->
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

</script>
