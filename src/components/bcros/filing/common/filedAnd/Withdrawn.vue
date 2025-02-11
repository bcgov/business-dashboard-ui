<template>
  <div>
    <span> {{ $t('text.filing.withdrawn') }} {{ $t('text.filing.on') }}
      <BcrosTooltipDate
        v-if="filing?.data?.withdrawnDate"
        :date="dateToString(apiToDate(filing.data.withdrawnDate))"
      />
      <span v-else> Unknown </span>
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
