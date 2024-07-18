<template>
  <div
    class="flex flex-col gap-1.5 bg-gray-100"
    data-cy="todoItemList"
  >
    <Component
      :is="filingComponent(filing)"
      v-for="filing in filings"
      :key="filing.filingId"
      :filing="filing"
    />
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'
import { FilingUtils } from '~/utils/filings'
import {
  LazyBcrosFilingItemAgmExtension,
  LazyBcrosFilingItemAlterationFiling,
  LazyBcrosFilingItemAmalgamationFiling,
  LazyBcrosFilingItemChangeOfAddress,
  LazyBcrosFilingItemConsentContinuationOut,
  LazyBcrosFilingItemPaperFiling,
  LazyBcrosFilingItemContinuationIn,
  LazyBcrosFilingItemContinuationOut,
  LazyBcrosFilingItemDefaultFiling,
  LazyBcrosFilingItemDissolutionVoluntary,
  LazyBcrosFilingItemIncorporationApplication,
  LazyBcrosFilingItemLimitedRestoration,
  LazyBcrosFilingItemLimitedRestorationConversion,
  LazyBcrosFilingItemLimitedRestorationExtension,
  LazyBcrosFilingItemRegistrationFiling,
  LazyBcrosFilingItemStaffFiling
} from '#components'

defineProps({
  filings: { type: Array<ApiResponseFilingI>, required: true }
})

/** Returns the name of the sub-component to use for the specified filing. */
const filingComponent = (filing: ApiResponseFilingI): Component => {
  switch (true) {
    case filing.availableOnPaperOnly:
      return LazyBcrosFilingItemPaperFiling // must come first
    case FilingUtils.isTypeAgmExtension(filing):
      return LazyBcrosFilingItemAgmExtension
    case FilingUtils.isTypeAlteration(filing):
      return LazyBcrosFilingItemAlterationFiling
    case FilingUtils.isTypeAmalgamationApplication(filing):
      return LazyBcrosFilingItemAmalgamationFiling
    case FilingUtils.isTypeChangeOfAddress(filing):
      return LazyBcrosFilingItemChangeOfAddress
    case FilingUtils.isTypeConsentContinuationOut(filing):
      return LazyBcrosFilingItemConsentContinuationOut
    case FilingUtils.isTypeContinuationIn(filing):
      return LazyBcrosFilingItemContinuationIn
    case FilingUtils.isTypeContinuationOut(filing):
      return LazyBcrosFilingItemContinuationOut
    case FilingUtils.isTypeDissolutionVoluntary(filing):
      return LazyBcrosFilingItemDissolutionVoluntary
    case FilingUtils.isTypeIncorporationApplication(filing):
      return LazyBcrosFilingItemIncorporationApplication
    case FilingUtils.isTypeRestorationLimited(filing):
      return LazyBcrosFilingItemLimitedRestoration
    case FilingUtils.isTypeRestorationLimitedExtension(filing):
      return LazyBcrosFilingItemLimitedRestorationExtension
    case FilingUtils.isTypeRestorationLimitedToFull(filing):
      return LazyBcrosFilingItemLimitedRestorationConversion
    case FilingUtils.isTypeRegistration(filing):
      return LazyBcrosFilingItemRegistrationFiling
    case FilingUtils.isTypeStaff(filing):
      return LazyBcrosFilingItemStaffFiling
    default:
      return LazyBcrosFilingItemDefaultFiling
  }
}
</script>
