<template>
  <div
    class="flex flex-col gap-1.5 bg-gray-100"
    data-cy="todoItemList"
  >
    <BcrosFilingItem
      v-for="filing in filings"
      :key="filing.filingId"
      :item="filing"
    />
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

defineProps({
  filings: { type: Array<ApiResponseFilingI>, required: true }
})
</script>
