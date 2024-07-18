<template>
  <BcrosFilingCommonTemplate data-cy="agm-extension" :filing="filing">
    <template #body>
      <!--      todo: add in next ticket #22331 -->
      TBD
      <!--      <div v-if="isFilingComplete">-->
      <!--        <p class="mt-0">-->
      <!--          The {{ agmYear }} AGM must be held by <strong>{{ agmDueDate }}</strong>.-->
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

// /** Whether the filing is complete. */
// get isFilingComplete (): boolean {
//   return EnumUtilities.isStatusCompleted(this.filing)
// }
//
// get agmYear (): string {
//   return this.filing.data?.agmExtension?.year || '[unknown]'
// }
//
// get agmDueDate (): string {
//   const yyyyMmDd = this.filing.data?.agmExtension?.expireDateApprovedExt
//   const date = DateUtilities.yyyyMmDdToDate(yyyyMmDd)
//   const pacificDate = DateUtilities.dateToPacificDate(date, true)
//   if (pacificDate) {
//     return `${pacificDate} at 11:59 pm Pacific time`
//   }
//   return '[unknown]'
// }

</script>
