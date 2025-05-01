<template>
  <BcrosFilingCommonTemplate
    :filing="filing"
    data-cy="amalgamation-out"
  >
    <template #body>
      <div v-if="isFilingStatus(filing, FilingStatusE.COMPLETED)" class="mt-4">
        <strong>{{ $t('text.filing.amalgamation.amalgamationOutComplete') }}</strong>

        <p class="mt-4">
          {{ $t('text.filing.common.theCompany') }} {{ currentBusinessName }}
          {{ $t('text.filing.common.wasSuccessfully') }}
          <strong>
            {{ $t('text.filing.amalgamation.amalgamatedOutOn') }} {{ amalgamationOutDate }},
            {{ $t('text.general.to') }}
            {{ foreignJurisdiction }} {{ $t('text.filing.amalgamation.underTheName') }} {{ newBusinessName }}.
          </strong>
          {{ $t('text.filing.amalgamation.companyStruckFromRegister') }}
        </p>

        <BcrosFilingCommonCourtNumber :filing="filing" />
        <BcrosFilingCommonPlanOfArrangement :filing="filing" />
      </div>
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import iso3166 from 'iso-3166-2'

const { currentBusinessName } = storeToRefs(useBcrosBusiness())
const t = useNuxtApp().$i18n.t

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const newBusinessName =
  props.filing.data?.amalgamationOut?.legalName || `[${t('text.general.unknown')}]`

const amalgamationOutDate =
  props.filing.data?.amalgamationOut?.amalgamationOutDate
    ? formatToMonthDayYear(props.filing.data?.amalgamationOut?.amalgamationOutDate)
    : `[${t('text.general.unknown')}]`

const getRegionName = (countryShortCode: string, regionShortCode: string): string =>
  regionShortCode.toUpperCase() === 'FEDERAL'
    ? 'Federal'
    : iso3166.subdivision(countryShortCode, regionShortCode).name

const foreignJurisdiction = computed(() => {
  const foreignJurisdictionCountry = props.filing.data?.amalgamationOut?.country?.toUpperCase()
  const countryName = iso3166.country(foreignJurisdictionCountry).name
  const regionShortCode = props.filing.data?.amalgamationOut?.region?.toUpperCase()

  if (regionShortCode && (foreignJurisdictionCountry === 'CA' || foreignJurisdictionCountry === 'US')) {
    const regionName = getRegionName(foreignJurisdictionCountry, regionShortCode)
    return regionName + ', ' + countryName
  } else {
    return countryName
  }
})
</script>
