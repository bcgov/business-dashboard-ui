<template>
  <BcrosFilingCommonTemplate
    :filing="filing"
    data-cy="limited-restoration"
  >
    <template #body>
      <!--      todo: add in next ticket #22331 -->
      TBD
      <!--      <div v-if="isFilingComplete">-->
      <!--        <h4>Limited Restoration Period</h4>-->

      <!--        <p class="mt-4">-->
      <!--          The Company <strong>{{ legalName }}</strong> was successfully restored and is active-->
      <!--          <strong>until {{ expiryDate }}</strong>. At the end of the limited restoration period,-->
      <!--          the company will be automatically dissolved. If you require assistance to extend a-->
      <!--          limited restoration/reinstatement or wish to convert your restoration from a limited-->
      <!--          period to a full restoration, please contact BC Registries staff:-->
      <!--        </p>-->

      <!--        <ContactInfo class="mt-4" />-->
      <!--      </div>-->
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
// /** The legal name from the restoration filing. */
// get legalName (): string {
//   return this.filing.data?.restoration?.toLegalName || '[unknown]'
// }

// /** The expiry date of the limited restoration filing as a Pacific date. */
// get expiryDate (): string {
//   const expiry = this.filing.data?.restoration?.expiry
//   const date = DateUtilities.yyyyMmDdToDate(expiry)
//   return (DateUtilities.dateToPacificDate(date, true) || '[unknown]')
// }

// /** Whether the filing is complete. */
// const isFilingComplete = computed((): boolean =>  FilingStatusUtils.isStatusCompleted(props.filing))
</script>
