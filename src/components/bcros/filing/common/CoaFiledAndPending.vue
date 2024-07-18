<template>
  <div class="flex flex-row gap-2 w-full ">
    <span>{{ $t('text.filing.filedAndPending') }} <BcrosFilingCommonFiledLabel :filing="filing" /></span>

    <BcrosTooltip
      :text="tooltipText"
      :popper="{
      placement: 'top',
      arrow: true
      }"
    >
      <UIcon color="orange darken-2" name="i-mdi-alert" />
    </BcrosTooltip>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

const t = useNuxtApp().$i18n.t

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

/** The effective date-time of this filing. */
const effectiveDateTime = computed((): string =>
  props.filing.effectiveDate
    // todo: this toLocaleString was actually //DateUtilities.dateToPacificDateTime(
    ? new Date(props.filing.effectiveDate).toLocaleString()
    : `[${t('tooltip.filing.coaFileAndPendingPart2')}]`
)
const tooltipText = computed(() =>
  `${t('tooltip.filing.coaFileAndPendingPart1')} ${effectiveDateTime} ${t('tooltip.filing.coaFileAndPendingPart2')}.`
)
</script>
