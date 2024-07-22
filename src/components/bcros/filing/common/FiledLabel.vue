<template>
  <div class="filed-label d-inline">
    <template v-if="isTypeStaff && putBackOnOrAdminDissolution">
      <span>
        {{ capitalizedFiledBy }} {{ filing.submitter }} {{ $t('text.filing.on') }}
        <BcrosFilingCommonDateWithTooltip :date="filing.submittedDate" />
      </span>
    </template>

    <template v-else>
      <div class="divide-x">
        <span>
          ({{ $t('text.filing.filedBy') }} {{ filing.submitter }} {{ $t('text.filing.on') }}
          <BcrosFilingCommonDateWithTooltip :date="filing.submittedDate" />)
        </span>
        &nbsp;
        <span>
          {{ $t('text.filing.effectiveAsOf').toString() }}
          <BcrosFilingCommonDateWithTooltip :date="filing.effectiveDate" />
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
</script>
