<template>
  <div class="filed-and-paid">
    <span>
      {{ $t('text.filing.filedAndPaid').toUpperCase() }}
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
