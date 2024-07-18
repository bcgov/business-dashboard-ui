<template>
  <BcrosFilingCommonTemplate
    :filing="filing"
    data-cy="limited-restoration-extension"
  >
    <template #body>
      <!--      todo: add in next ticket #22331 -->
      TBD
      <!--      <h4>Extension of Limited Restoration</h4>-->

      <!--      <p>-->
      <!--        The period of restoration was successfuly extended and is active <strong>until-->
      <!--          {{ expiryDate }}</strong>. At the end of the extended limited restoration period, the-->
      <!--        company will be automatically dissolved. If you require assistance to extend a limited-->
      <!--        restoration/reinstatement or wish to convert your restoration from a limited period to-->
      <!--        a full restoration, please contact BC Registries staff:-->
      <!--      </p>-->

      <!--      <ContactInfo class="mt-4" />-->
    </template>
  </BcrosFilingCommonTemplate>
</template>


<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

// /** The expiry date of the limited restoration extension filing as a Pacific date. */
// const expiryDate = computed((): string => {
//   const expiry = props.filing.data?.restoration?.expiry
//   const date = DateUtilities.yyyyMmDdToDate(expiry)
//   return (DateUtilities.dateToPacificDate(date, true) || '[unknown]')
// })
</script>
