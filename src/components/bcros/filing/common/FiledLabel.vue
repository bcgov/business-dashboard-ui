<template>
  <div class="filed-label d-inline">
    <template v-if="isTypeStaff && putBackOnOrAdminDissolution">
      <span>
        {{ capitalizedFiledBy }} {{ filing.submitter }} {{ $t('text.filing.on') }}
        <BcrosTooltipDate :date="filing.submittedDate" />
      </span>
    </template>

    <template v-else>
      <div class="flex flex-row gap-2 w-full">
        <span>
          ({{ $t('text.filing.filedBy') }} {{ filing.submitter }} {{ $t('text.filing.on') }}
          <BcrosTooltipDate :date="filing.submittedDate" />)
        </span>
        <UDivider v-if="showEffectiveAs" orientation="vertical" :ui="{ border: { base: 'border-gray-600'} }" />
        <span v-if="showEffectiveAs">
          {{ $t('text.filing.effectiveAsOf').toString() }}
          <BcrosTooltipDate :date="filing.effectiveDate" />
        </span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { FilingTypes } from '@bcrs-shared-components/enums'
import type { ApiResponseFilingI } from '#imports'
import { isStaffFiling } from '#imports'

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

const showEffectiveAs = computed(() => {
  // consider converting to which ones to show
  const dontShow = [
    FilingTypes.REGISTRARS_NOTATION,
    FilingTypes.REGISTRARS_ORDER,
    FilingTypes.COURT_ORDER
  ]
  return !dontShow.includes(props.filing.name)
})
</script>
