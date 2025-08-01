<template>
  <div>
    <span class="text-orange-500 font-bold">
      {{ $t('text.filing.rejected') }}
    </span>
    <BcrosDivider class="mx-2" />
    <span>
      {{ $t('text.filing.submittedBy') }} {{ filing.submitter }} {{ $t('text.filing.on') }}
      <BcrosTooltipDate :date="filing.paymentDate || filing.submittedDate" />
    </span>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
</script>
