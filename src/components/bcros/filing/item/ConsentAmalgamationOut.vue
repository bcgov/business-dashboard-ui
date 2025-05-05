<template>
  <BcrosFilingCommonTemplate :filing="filing" data-cy="consent-amalgamation-out">
    <template #body>
      <div>
        <p v-if="expiry && !isConsentExpired" class="mt-4">
          {{ $t('text.filing.amalgamation.consentAmalgamateOutTo') }} {{ foreignJurisdiction }}
          {{ $t('text.filing.amalgamation.isValid') }}
          <strong>{{ $t('text.filing.amalgamation.until') }}&nbsp;{{ expiry }}</strong>.
        </p>

        <p v-if="expiry && isConsentExpired" class="mt-4">
          <UIcon name="i-mdi-alert" class="text-orange-500" />
          {{ $t('text.filing.amalgamation.expiredConsent') }}
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

const expiry = props.filing.data?.consentAmalgamationOut?.expiry
  ? dateToPacificDateTime(new Date(props.filing.data?.consentAmalgamationOut?.expiry))
  : null

/** Check if Consent is Expired. (Assumes expiry is not empty.) */
const isConsentExpired: Ref<boolean> = computed(() => {
  const expiry = props.filing.data?.consentAmalgamationOut?.expiry
  if (expiry) {
    const date = new Date(expiry)
    const daysToExpire = daysBetweenTwoDates(new Date(), date)
    if (daysToExpire < 0) {
      return true
    }
  }
  return false
})

const getRegionName = (countryShortCode: string, regionShortCode: string): string =>
  regionShortCode.toUpperCase() === 'FEDERAL'
    ? 'Federal'
    : iso3166.subdivision(countryShortCode, regionShortCode).name

const foreignJurisdiction: Ref<string> = computed(() => {
  const foreignJurisdictionCountry = props.filing.data?.consentAmalgamationOut?.country?.toUpperCase()
  const countryName = iso3166.country(foreignJurisdictionCountry).name
  const regionShortCode = props.filing.data?.consentAmalgamationOut?.region?.toUpperCase()

  if (regionShortCode && regionShortCode.toUpperCase() !== 'FEDERAL' &&
    (foreignJurisdictionCountry === 'CA' || foreignJurisdictionCountry === 'US')) {
    const regionName = getRegionName(foreignJurisdictionCountry, regionShortCode)
    return regionName + ', ' + countryName
  } else {
    return countryName
  }
})
</script>
