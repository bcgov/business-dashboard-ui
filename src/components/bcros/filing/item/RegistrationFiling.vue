<template>
  <BcrosFilingCommonTemplate :filing="filing" data-cy="registration-filing" />
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
</script>
