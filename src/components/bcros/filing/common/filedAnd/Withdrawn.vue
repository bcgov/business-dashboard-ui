<template>
  <div>
    <span>WITHDRAWN {{ $t('text.filing.on') }}
    <BcrosTooltipDate :date="filing.withdrawnDate" />
</span>
    <BcrosDivider class="mx-2" />
    <span>{{ $t('text.filing.paid') }}</span>
    <BcrosFilingCommonFiledLabel :filing="filing" />
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
</script>
