<template>
  <div
    class="flex flex-col gap-1.5 bg-gray-100"
    data-cy="FilingHistoryList"
  >
    <Component
      :is="filingComponent(filing)"
      v-for="filing in filings"
      :key="filing.filingId"
      :filing="filing"
    />

    <div v-if="filings.length === 0" class="flex flex-col w-full bg-white p-3 rounded">
      <div v-if="isTemporaryRegistration" data-cy="tempRegistration-filing-history-empty">
        {{ $t('text.filing.completeYourFilingToDisplay') }}
      </div>
      <div v-else-if="isBusiness" data-cy="business-filing-history-empty">
        <div>
          <strong>{{ $t('text.filing.youHaveNoFilingHistory') }}</strong>
        </div>
        <div> {{ $t('text.filing.yourFilingsWillAppearHere') }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FilingTypes } from '@bcrs-shared-components/enums'
import type { ApiResponseFilingI } from '~/interfaces/filing-i'
import { isFilingType } from '#imports'
import {
  LazyBcrosFilingItemAgmExtension,
  LazyBcrosFilingItemAlterationFiling,
  LazyBcrosFilingItemAmalgamationFiling,
  LazyBcrosFilingItemChangeOfAddress,
  LazyBcrosFilingItemConsentContinuationOut,
  LazyBcrosFilingItemContinuationIn,
  LazyBcrosFilingItemContinuationOut,
  LazyBcrosFilingItemDefaultFiling,
  LazyBcrosFilingItemDissolutionVoluntary,
  LazyBcrosFilingItemIncorporationApplication,
  LazyBcrosFilingItemLimitedRestoration,
  LazyBcrosFilingItemLimitedRestorationConversion,
  LazyBcrosFilingItemLimitedRestorationExtension,
  LazyBcrosFilingItemPaperFiling,
  LazyBcrosFilingItemRegistrationFiling,
  LazyBcrosFilingItemStaffFiling
} from '#components'

defineProps({
  filings: { type: Array<ApiResponseFilingI>, required: true }
})

const isBusiness = computed(() => useBcrosBusiness().currentBusiness?.identifier)

const isTemporaryRegistration = !!sessionStorage.getItem('TEMP_REG_NUMBER')

/** Returns the name of the sub-component to use for the specified filing. */
const filingComponent = (filing: ApiResponseFilingI): Component => {
  switch (true) {
    case filing.availableOnPaperOnly:
      return LazyBcrosFilingItemPaperFiling // must come first
    case isFilingType(filing, FilingTypes.AGM_EXTENSION):
      return LazyBcrosFilingItemAgmExtension
    case isFilingType(filing, FilingTypes.ALTERATION):
      return LazyBcrosFilingItemAlterationFiling
    case isFilingType(filing, FilingTypes.AMALGAMATION_APPLICATION):
      return LazyBcrosFilingItemAmalgamationFiling
    case isFilingType(filing, FilingTypes.CHANGE_OF_ADDRESS):
      return LazyBcrosFilingItemChangeOfAddress
    case isFilingType(filing, FilingTypes.CONSENT_CONTINUATION_OUT):
      return LazyBcrosFilingItemConsentContinuationOut
    case isFilingType(filing, FilingTypes.CONTINUATION_IN):
      return LazyBcrosFilingItemContinuationIn
    case isFilingType(filing, FilingTypes.CONTINUATION_OUT):
      return LazyBcrosFilingItemContinuationOut
    case isFilingType(filing, undefined, FilingSubTypeE.DISSOLUTION_VOLUNTARY):
      return LazyBcrosFilingItemDissolutionVoluntary
    case isFilingType(filing, FilingTypes.INCORPORATION_APPLICATION):
      return LazyBcrosFilingItemIncorporationApplication
    case isFilingType(filing, undefined, FilingSubTypeE.LIMITED_RESTORATION):
      return LazyBcrosFilingItemLimitedRestoration
    case isFilingType(filing, undefined, FilingSubTypeE.LIMITED_RESTORATION_EXTENSION):
      return LazyBcrosFilingItemLimitedRestorationExtension
    case isFilingType(filing, undefined, FilingSubTypeE.LIMITED_RESTORATION_TO_FULL):
      return LazyBcrosFilingItemLimitedRestorationConversion
    case isFilingType(filing, FilingTypes.REGISTRATION):
      return LazyBcrosFilingItemRegistrationFiling
    case isStaffFiling(filing):
      return LazyBcrosFilingItemStaffFiling
    default:
      return LazyBcrosFilingItemDefaultFiling
  }
}
</script>
