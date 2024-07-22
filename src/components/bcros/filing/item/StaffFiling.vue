1
<template>
  <BcrosFilingCommonTemplate :filing="filing" data-cy="staff-filing">
    <template #title>
      <UIcon v-if="isTypeCourtOrder" name="i-mdi-gavel" />
      <!--  todo: should we internationalize this ?? -->
      <span>{{ filing.displayName }}</span>
    </template>

    <template #subtitle>
      <div class="flex flex-row gap-1 w-full">
        <span v-if="putBackOnOrAdminDissolution">{{ $t('text.filing.filed') }}</span>
        <BcrosFilingCommonFiledLabel :filing="filing" />
      </div>
    </template>

    <template #body>
      <div>
        <!--      todo: add in next ticket #22331 -->
        TBD
        <!-- see: -->
        <!-- eslint-disable-next-line max-len -->
        <!-- https://github.com/bcgov/business-filings-ui/blob/main/src/components/Dashboard/FilingHistoryList/filings/RegistrationFiling.vue -->
      </div>
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import { FilingTypes } from '@bcrs-shared-components/enums'
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const isTypeCourtOrder = computed((): boolean => isFilingType(props.filing, FilingTypes.COURT_ORDER))

const putBackOnOrAdminDissolution = computed(() =>
  isFilingType(props.filing, FilingTypes.PUT_BACK_ON) ||
  isFilingType(props.filing, undefined, FilingSubTypeE.DISSOLUTION_ADMINISTRATIVE)
)

</script>
