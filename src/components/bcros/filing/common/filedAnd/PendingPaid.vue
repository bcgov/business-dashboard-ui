<template>
  <div class="flex flex-row gap-2 w-full">
    <span class="orange--text text--darken-2">
      {{ $t('text.filing.filedAndPending') }}
    </span>
    <span>
      {{ $t('text.filing.paid') }}
      <BcrosFilingCommonFiledLabel :filing="filing" />
    </span>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
</script>
