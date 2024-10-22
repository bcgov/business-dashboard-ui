<template>
  <div class="flex flex-row gap-2">
    <span class="text-orange-500 font-bold">
      {{ $t('text.filing.rejected') }}
    </span>
    <UDivider orientation="vertical" :ui="{ border: { base: 'border-gray-600'} }" />
    <span>
      {{ $t('text.filing.submittedBy') }} {{ filing.submitter }} {{ $t('text.filing.on') }}
      <BcrosTooltipDate :date="filing.submittedDate" />
    </span>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
</script>
