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
import type { ApiResponseFilingI } from '~/interfaces/filing-i'
import { FilingUtils } from '~/utils/filings'

const t = useNuxtApp().$i18n.t

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const capitalizedFiledBy =
  t('text.filing.filedBy').charAt(0).toUpperCase() + t('text.filing.filedBy').slice(1)

const isTypeStaff = computed(() => FilingUtils.isTypeStaff(props.filing))

const putBackOnOrAdminDissolution = computed(
  () => FilingUtils.isTypePutBackOn(props.filing) || FilingUtils.isTypeDissolutionAdministrative(props.filing)
)
</script>
