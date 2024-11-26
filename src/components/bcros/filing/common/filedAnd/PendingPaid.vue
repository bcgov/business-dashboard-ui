<template>
  <div>
    <span class="text-orange-500">
      {{ $t('text.filing.filedAndPending') }}
    </span>
    <BcrosDivider class="mx-2" />
    <span>{{ $t('text.filing.paid') }}</span>
    <BcrosFilingCommonFiledLabel :filing="filing" />
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
</script>
