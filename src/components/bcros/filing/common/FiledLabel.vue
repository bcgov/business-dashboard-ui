<template>
  <template v-if="isTypeStaff">
    <span v-if="putBackOnOrAdminDissolution">
      ({{ $t('text.filing.filedBy') }} {{ filing.submitter }} {{ $t('text.filing.on') }}
      <BcrosTooltipDate :date="filedAndPaidDate" />)
      <BcrosDivider class="ml-1 mr-2" />
      {{ $t('text.filing.effectiveAsOf').toString() }}
      <BcrosTooltipDate :date="filing.effectiveDate" />
    </span>
    <span v-else>
      {{ capitalizedFiledBy }} {{ filing.submitter }} {{ $t('text.filing.on') }}
      <BcrosTooltipDate :date="filedAndPaidDate" />
    </span>
  </template>

  <template v-else>
    <span v-if="isChangeOfOfficersType(props.filing)">
      {{ $t('text.filing.submittedBy') }} {{ filing.submitter }} {{ $t('text.filing.on') }}
      <BcrosTooltipDate :date="filedAndPaidDate" />
    </span>
    <span v-else>
      ({{ $t('text.filing.filedBy') }} {{ filing.submitter }} {{ $t('text.filing.on') }}
      <BcrosTooltipDate :date="filedAndPaidDate" />)
    </span>
    <span v-if="showEffectiveAs">
      <BcrosDivider class="ml-1 mr-2" />
      {{ $t('text.filing.effectiveAsOf').toString() }}
      <BcrosTooltipDate :date="filing.effectiveDate" :hide-tooltip="hideTooltip" />
    </span>
  </template>
</template>

<script setup lang="ts">
import { FilingTypes } from '@bcrs-shared-components/enums'
import type { ApiResponseFilingI } from '#imports'
import { isStaffFiling, FilingStatusE } from '#imports'

const t = useNuxtApp().$i18n.t

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const capitalizedFiledBy =
  t('text.filing.filedBy').charAt(0).toUpperCase() + t('text.filing.filedBy').slice(1)

const isTypeStaff = computed(() => isStaffFiling(props.filing))

const putBackOnOrAdminDissolution = computed(
  () => isFilingType(props.filing, FilingTypes.PUT_BACK_ON) ||
    isFilingType(props.filing, undefined, FilingSubTypeE.DISSOLUTION_ADMINISTRATIVE)
)

/** Date to use for Filed and Paid. */
const filedAndPaidDate = computed(
  () => props.filing.paymentDate || props.filing.submittedDate
)

const showEffectiveAs = computed(() => {
  // consider converting to which ones to show
  const dontShow = [
    FilingTypes.REGISTRARS_NOTATION,
    FilingTypes.REGISTRARS_ORDER,
    FilingTypes.COURT_ORDER
  ]
  const isWithdrawn = props.filing.status === FilingStatusE.WITHDRAWN
  return !dontShow.includes(props.filing.name) && !isWithdrawn
})

/** Whether to hide the tooltip (which effectively hides the effective time). */
const hideTooltip = computed(() => {
  return isFilingType(props.filing, FilingTypes.CHANGE_OF_DIRECTORS)
})
</script>
