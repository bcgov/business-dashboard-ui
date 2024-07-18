<template>
  <BcrosFilingCommonTemplate
    :filing="filing"
    data-cy="continuation-out"
  >
    <template #body>
      <!--      todo: add in next ticket #22331 -->
      TBD
      <!--      <div v-if="isFilingComplete">-->
      <!--        <h4>Continuation Out Complete</h4>-->

      <!--        <p class="mt-4">-->
      <!--          The Company {{ legalName }} was successfully-->
      <!--          <strong>-->
      <!--            Continued Out on {{ continuationOutDate }}, to-->
      <!--            {{ foreignJurisdiction }} under the name {{ legalName }}.-->
      <!--          </strong>-->
      <!--          The Company has been struck from the register and ceased to be an-->
      <!--          incorporated company under the Business Corporations Act.-->
      <!--          You are required to retain a copy of all the Continuation Out documents in your records books.-->
      <!--        </p>-->

      <!--        <p-->
      <!--          v-if="fileNumber"-->
      <!--          class="mt-4 mb-0"-->
      <!--        >-->
      <!--          Court Order Number: {{ fileNumber }}-->
      <!--        </p>-->

      <!--        <p-->
      <!--          v-if="hasEffectOfOrder"-->
      <!--          class="mt-0"-->
      <!--        >-->
      <!--          Pursuant to a Plan of Arrangement-->
      <!--        </p>-->
      <!--      </div>-->
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
// todo: verify if the one in business store can be used in this place
// get legalName (): string {
//   return this.filing.data?.continuationOut?.legalName
// }
//
// get continuationOutDate (): string {
//   const continuationOutDate = this.filing.data?.continuationOut?.continuationOutDate
//   if (continuationOutDate) {
//     return DateUtilities.formatYyyyMmDd(continuationOutDate)
//   }
//   return '[unknown]'
// }
//
// get foreignJurisdiction (): string {
//   const foreignJusrisdictionCountry = this.filing.data?.continuationOut?.country
//   const country = this.getCountryName(this.filing.data?.continuationOut?.country)
//   const region = this.getRegionNameFromCode(this.filing.data?.continuationOut?.region)
//
//   if (foreignJusrisdictionCountry === 'CA' || foreignJusrisdictionCountry === 'US') {
//     return region + ', ' + country
//   } else {
//     return country
//   }
// }
//
// /** Get the respective regions of the country selected as an array of objects. */
// get canadaUsaRegions (): Array<any> {
//   const foreignJusrisdictionCountry = this.filing.data?.continuationOut?.country
//   if (foreignJusrisdictionCountry === 'CA') {
//     return this.getCountryRegions('CA')
//   } else if (foreignJusrisdictionCountry === 'US') {
//     return this.getCountryRegions('US')
//   }
//   return []
// }
//
// private getRegionNameFromCode (short: string): string {
//   const region = this.canadaUsaRegions?.find(region => region.short === short)
//   return region?.name
// }
//
// /** The court order file number. */
// get fileNumber (): string {
//   return this.filing.data?.order?.fileNumber
// }
//
// /** Whether the court order has an effect of order. */
// get hasEffectOfOrder (): boolean {
//   return Boolean(this.filing.data?.order?.effectOfOrder)
// }
//
// /** Whether the filing is complete. */
// get isFilingComplete (): boolean {
//   return EnumUtilities.isStatusCompleted(this.filing)
// }

</script>
