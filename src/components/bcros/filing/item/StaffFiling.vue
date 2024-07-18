1
<template>
  <BcrosFilingCommonTemplate :filing="filing" data-cy="staff-filing">
    <template #title>
      <UIcon v-if="isTypeCourtOrder" name="i-mdi-gavel" />
      <!--  todo: should we internationalize this ?? -->
      <span>{{ filing.displayName }}</span>
    </template>

    <template #subtitle>
      <div class="item-header-subtitle filed-staff">
        <span v-if="putBackOnOrAdminDissolution">{{ $t('text.filing.filed') }}</span>
        <BcrosFilingCommonFiledLabel :filing="filing" />
      </div>
    </template>

    <template #body>
      <div>
        <!--      todo: add in next ticket #22331 -->
        TBD
        <!--        <p-->
        <!--          v-if="orderDetails"-->
        <!--          class="mt-4"-->
        <!--          v-html="orderDetails"-->
        <!--        />-->

        <!--        &lt;!&ndash; if we have documents, show them &ndash;&gt;-->
        <!--        &lt;!&ndash; NB: only court orders have documents - see also FilingTemplate.vue &ndash;&gt;-->
        <!--        <DocumentsList-->
        <!--          v-if="isTypeCourtOrder && filing.documents && filing.documents.length > 0"-->
        <!--          class="mt-4"-->
        <!--          :filing="filing"-->
        <!--        />-->

        <!--        <p-->
        <!--          v-if="fileNumber"-->
        <!--          class="mt-4"-->
        <!--        >-->
        <!--          Court Order Number: {{ fileNumber }}-->
        <!--        </p>-->

        <!--        <p-->
        <!--          v-if="hasEffectOfOrder"-->
        <!--          class="mt-4"-->
        <!--        >-->
        <!--          Pursuant to a Plan of Arrangement-->
        <!--        </p>-->
      </div>
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const isTypeCourtOrder = computed((): boolean => FilingUtils.isTypeCourtOrder(props.filing))

const putBackOnOrAdminDissolution = computed(() =>
  FilingUtils.isTypePutBackOn(props.filing) ||
  FilingUtils.isTypeDissolutionAdministrative(props.filing)
)

// const orderDetails = computed(
//   () => props.filing.data?.order?.orderDetails?.replaceAll('\n', '<br/>')
// )
//
// /** The court order file number. */
// const fileNumber = computed(() => props.filing.data?.order?.fileNumber)
//
// /** Whether the court order has an effect of order. */
// const hasEffectOfOrder = computed(() => !!props.filing.data?.order?.effectOfOrder)

</script>
