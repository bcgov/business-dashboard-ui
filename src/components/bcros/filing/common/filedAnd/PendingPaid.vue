<template>
  <div class="break-words">
    <span class="text-orange-500">
      {{ $t('text.filing.filedAndPending') }}
    </span>
    <BcrosDivider />
    {{ $t('text.filing.paid') }}
    <BcrosFilingCommonFiledLabel :filing="filing" />
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
</script>
