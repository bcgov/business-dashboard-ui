<template>
  <div class="break-words">
    <span class="text-orange-500 font-bold">
      {{ $t('text.filing.rejected') }}
    </span>
    <BcrosDivider />
    <span>
      {{ $t('text.filing.submittedBy') }} {{ filing.submitter }} {{ $t('text.filing.on') }}
    </span>
    <BcrosTooltipDate :date="filing.submittedDate" />
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
</script>
