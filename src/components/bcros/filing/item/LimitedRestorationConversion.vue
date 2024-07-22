<template>
  <BcrosFilingCommonTemplate
    :filing="filing"
    data-cy="limited-restoration-conversion"
  >
    <!-- just use all fallback slots -->
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
</script>
