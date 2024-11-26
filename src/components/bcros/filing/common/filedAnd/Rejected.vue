<template>
  <div>
    <span class="text-orange-500 font-bold">
      {{ $t('text.filing.rejected') }}
    </span>
    <BcrosDivider class="ml-1 mr-2" />
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
