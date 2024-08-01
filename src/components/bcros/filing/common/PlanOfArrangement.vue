<template>
  <p v-if="hasEffectOfOrder" class="mt-4"  data-cy="pursuant-to-a-plan">
    {{ $t('text.filing.common.pursuantToAPlanOfArrangement') }}
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
