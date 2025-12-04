<template>
  <div>
    <UIcon name="i-mdi-clock-outline" class="text-lg text-orange-500 mr-1 -mb-1" />
    <span>{{ $t('text.filing.pending') }}</span>
    <BcrosDivider class="mx-2" />
    <span>{{ $t('text.filing.paymentCompleted') }}</span>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
</script>
