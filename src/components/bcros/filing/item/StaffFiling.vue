<template>
  <BcrosFilingCommonTemplate :filing="filing" data-cy="staff-filing">
    <template #title>
      <div class="flex flex-row items-center gap-3">
        <UIcon v-if="isTypeCourtOrder" name="i-mdi-gavel" />
        <!--  todo: should we internationalize this ?? -->
        <span>{{ filing.displayName }}</span>
      </div>
    </template>

    <template #subtitle>
      <span v-if="putBackOnOrAdminDissolution">{{ $t('text.filing.filed') }}</span>
      <BcrosFilingCommonFiledLabel :filing="filing" />
    </template>

    <template #body>
      <div>
        <div class="staff-filing-details body-2">
          <hr class="my-6  border-bg-bcGovGray-300">
          <p v-if="orderDetails" class="mt-4" v-html="orderDetails" />
          <BcrosFilingCommonCourtNumber :filing="filing" />
          <BcrosFilingCommonPlanOfArrangement :filing="filing" />

          <BcrosFilingCommonCourtNumber :filing="filing" />
          <BcrosFilingCommonPlanOfArrangement :filing="filing" />

          <!-- if we have documents, show them -->
          <!-- NB: only court orders have documents - see also FilingTemplate.vue -->
          <hr class="my-6  border-bg-bcGovGray-300">

          <BcrosFilingCommonDocumentsList
            v-if="isTypeCourtOrder && filing.documents && filing.documents.length > 0"
            class="mt-4"
            :filing="filing"
          />
        </div>
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

const orderDetails = props.filing.data?.order?.orderDetails?.replaceAll('\n', '<br/>')
</script>
