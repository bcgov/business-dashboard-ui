<template>
  <div class="flex flex-row gap-2 w-full">
    <span class="orange--text text--darken-2">
      {{ $t('text.filing.filedAndPending') }}
    </span>
    <UDivider orientation="vertical" :ui="{ border: { base: 'border-gray-600'} }" />
    <div>
      <span>{{ $t('text.filing.paid') }} <BcrosFilingCommonFiledLabel :filing="filing" />      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
</script>
