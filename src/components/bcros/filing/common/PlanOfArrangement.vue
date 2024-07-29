<template>
  <p v-if="hasEffectOfOrder" class="mt-4">
    Pursuant to a Plan of Arrangement
  </p>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

/** Whether the court order has an effect of order. */
const hasEffectOfOrder = !!props.filing.data?.order?.effectOfOrder
</script>
