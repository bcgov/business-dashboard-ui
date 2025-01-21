<template>
  <div class="flex flex-col gap-1 items-start w-full">
    <span>
      {{ $t('text.filing.filedAndPending') }}
      <BcrosFilingCommonFiledLabel :filing="filing" />
    </span>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
</script>
