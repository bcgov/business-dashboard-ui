<template>
  <BcrosFilingCommonTemplate :filing="filing" data-cy="consent-continuation-out">
    <template #body>
      <div>
        <p v-if="expiry && !isConsentExpired" class="mt-0">
          {{ $t('text.filing.continuation.consentContinueOutTo') }} {{ foreignJurisdiction }}&nbsp;
          {{ $t('text.filing.continuation.isValid') }}&nbsp;
          <strong>{{ $t('text.filing.continuation.until') }}&nbsp;{{ expiry }}</strong>.
        </p>

        <p v-if="expiry && isConsentExpired" class="mt-4">
          <UIcon name="i-mdi-alert" class="text-orange-500" />
          {{ $t('text.filing.continuation.expiredConsent') }}
        </p>

        <BcrosFilingCommonCourtNumber :filing="filing" />
        <BcrosFilingCommonPlanOfArrangement :filing="filing" />
      </div>
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import iso3166 from 'iso-3166-2'
import type { ApiResponseFilingI } from '#imports'
import { dateToPacificDateTime, daysBetweenTwoDates } from '#imports'

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const expiry = props.filing.data?.consentContinuationOut?.expiry
  ? dateToPacificDateTime(new Date(props.filing.data?.consentContinuationOut?.expiry))
  : null

/** Check if Consent is Expired. (Assumes expiry is not empty.) */
const isConsentExpired = (): boolean => {
  const expiry = props.filing.data?.consentContinuationOut?.expiry
  if (expiry) {
    const date = new Date(expiry)
    const daysToExpire = daysBetweenTwoDates(new Date(), date)
    if (daysToExpire < 0) {
      return true
    }
  }
  return false
}

const getRegionName = (countryShortCode: string, regionShortCode: string): string =>
  regionShortCode.toUpperCase() === 'FEDERAL'
    ? 'Federal'
    : iso3166.subdivision(countryShortCode, regionShortCode)

const foreignJurisdiction = (): string => {
  const foreignJurisdictionCountry = props.filing.data?.consentContinuationOut?.country?.toUpperCase()
  const countryName = iso3166.country(foreignJurisdictionCountry)
  const regionShortCode = props.filing.data?.consentContinuationOut?.region?.toUpperCase()
  const regionName = getRegionName(foreignJurisdictionCountry, regionShortCode)

  if (foreignJurisdictionCountry === 'CA' || foreignJurisdictionCountry === 'US') {
    return regionName + ', ' + countryName
  } else {
    return countryName
  }
}
</script>
