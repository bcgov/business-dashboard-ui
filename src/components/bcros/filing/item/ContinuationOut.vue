<template>
  <BcrosFilingCommonTemplate
    :filing="filing"
    data-cy="continuation-out"
  >
    <template #body>
      <div v-if="isFilingStatus(filing, FilingStatusE.COMPLETED)">
        <strong>{{ $t('text.filing.continuation.continuationOutComplete') }}</strong>

        <p class="mt-4">
          {{ $t('text.filing.common.theCompany') }} {{ currentBusinessName }}
          {{ $t('text.filing.common.wasSuccessfully') }}
          <strong>
            {{ $t('text.filing.continuation.continuedOutOn') }} {{ continuationOutDate }},
            {{ $t('text.general.to') }}
            {{ foreignJurisdiction }} {{ $t('text.filing.continuation.underTheName') }} {{ currentBusinessName }}.
          </strong>
          {{ $t('text.filing.continuation.companyStruckFromRegister') }}
        </p>

        <BcrosFilingCommonCourtNumber :filing="filing" />
        <BcrosFilingCommonPlanOfArrangement :filing="filing" />
      </div>
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import iso3166 from 'iso-3166-2'

import { type ApiResponseFilingI, formatToMonthDayYear } from '#imports'

const { currentBusinessName } = storeToRefs(useBcrosBusiness())
const t = useNuxtApp().$i18n.t

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const continuationOutDate =
  props.filing.data?.continuationOut?.continuationOutDate
    ? formatToMonthDayYear(props.filing.data?.continuationOut?.continuationOutDate)
    : `[${t('text.general.unknown')}]`

const getRegionName = (countryShortCode: string, regionShortCode: string): string =>
  regionShortCode.toUpperCase() === 'FEDERAL'
    ? 'Federal'
    : iso3166.subdivision(countryShortCode, regionShortCode).name

const foreignJurisdiction = computed(() => {
  const foreignJurisdictionCountry = props.filing.data?.continuationOut?.country?.toUpperCase()
  const countryName = iso3166.country(foreignJurisdictionCountry).name
  const regionShortCode = props.filing.data?.continuationOut?.region?.toUpperCase()
  const regionName = getRegionName(foreignJurisdictionCountry, regionShortCode)

  if (foreignJurisdictionCountry === 'CA' || foreignJurisdictionCountry === 'US') {
    return regionName + ', ' + countryName
  } else {
    return countryName
  }
})
</script>
