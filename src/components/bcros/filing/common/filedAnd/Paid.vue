<template>
  <div>
    <span>{{ $t('text.filing.filedAndPaid') }}</span>
    <BcrosFilingCommonFiledLabel :filing="filing" />
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
</script>
