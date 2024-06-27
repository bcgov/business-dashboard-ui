<template>
  <div class="flex flex-row gap-3 items-center">

    <!--    staff comments todo: -->
    <!-- COLIN link button -->
    <span
      v-if="isDisableNonBenCorps && !!currentBusiness.identifier"
    >
      <BcrosTooltip
        :text="$t('tooltip.filing.button.colinLink')"
        :popper="{
              placement: 'top',
              arrow: true
            }"
      >
        <UButton
          variant="ghost"
          leading-icon="i-mdi-file-document-edit-outline"
          class="w-full text-nowrap"
          @click="navigateTo('https://www.corporateonline.gov.bc.ca/', { external: true})"
        >
          <span class="font-13 ml-1">{{ $t('button.tombstone.colinLink') }}</span>
        </UButton>
      </BcrosTooltip>
    </span>

    <!-- View and Change Business Information -->
    <span
      v-if="!isDisableNonBenCorps && currentBusiness.identifier && currentBusiness.state !== BusinessStateE.HISTORICAL">
      <UButton
        id="business-information-button"
        small
        text
        color="primary"
        variant="ghost"
        :disabled="isChangeBusinessInfoDisabled"
        class="w-full text-nowrap"
        leading-icon="i-mdi-file-document-edit-outline"
        @click="promptChangeBusinessInfo()"
      >
        <span class="font-13 ml-1">{{ $t('button.tombstone.viewAndChangeBusinessInfo') }}</span>
      </UButton>

      <BcrosTooltip
        v-if="isPendingDissolution"
        :text="$t('tooltip.filing.button.isPendingDissolution')"
        :popper="{
              placement: 'top',
              arrow: true
            }"
      >
          <UIcon
            class="pr-2 text-orange-500 text-xl"
            name="i-mdi-alert"
          />
      </BcrosTooltip>
    </span>

    <!-- Download Business Summary -->
    <span
      v-if="!isDisableNonBenCorps && isAllowedBusinessSummary"
    >
      <BcrosTooltip
        :text="$t('tooltip.filing.button.businessSummary')"
        :popper="{
              placement: 'top',
              arrow: true
            }"
      >
        <UButton
          id="download-summary-button"
          small
          text
          variant="ghost"
          class="w-full text-nowrap"
          @click="downloadBusinessSummary"
        >
          <template #leading>
            <img
              src="@/assets/images/business_summary_icon.svg"
              alt=""
              class="pa-1"
            >
          </template>
          <span class="font-13 ml-1">{{ $t('button.tombstone.businessSummary') }}</span>
        </UButton>
      </BcrosTooltip>
    </span>

    <div class="mb-2">
      <BcrosBusinessDetailsLinkActions v-if="!isDisableNonBenCorps && currentBusiness.identifier" />
    </div>

  </div>
</template>

<script setup lang="ts">
import { CorpTypeCd } from '@bcrs-shared-components/enums'
import type { DocumentI } from '~/interfaces/document-i'
import { fetchDocuments } from '~/services/legal-s'
import { BusinessStateE } from '~/enums/business-state-e'

const { currentBusiness } = storeToRefs(useBcrosBusiness())
const bcrosLaunchdarkly = useBcrosLaunchdarkly()

const enableNonBenCorpsFlag = computed(() => bcrosLaunchdarkly.getStoredFlag('enable-non-ben-corps'))
const isAllowedBusinessSummary = computed(() =>
  !!bcrosLaunchdarkly
    .getStoredFlag('supported-business-summary-entities')?.includes(currentBusiness.value.legalType)
)


const isDisableNonBenCorps = computed(() => {
  if ([CorpTypeCd.BENEFIT_COMPANY, CorpTypeCd.BC_ULC_COMPANY, CorpTypeCd.BC_CCC]
    .includes(currentBusiness.value.legalType)) {
    return !enableNonBenCorpsFlag
  }
  return false
})


const isPendingDissolution = computed(() => {
  return false
  //todo: implement !!FUTURE not implemented in current dashboard
})

const isChangeBusinessInfoDisabled = computed(() => {
  return false
  //todo: implement
})
const promptChangeBusinessInfo = () => {
  //todo: implement
}

/** Request and Download Business Summary Document. */
const downloadBusinessSummary = async (): Promise<void> => {
  // todo: add loading full screen // ticket #22059
  // this.setFetchingDataSpinner(true)
  const businessId = currentBusiness.value.identifier
  const apiURL = useRuntimeConfig().public.legalApiURL
  const summaryDocument: DocumentI = {
    title: 'Summary',
    filename: `${businessId} Summary - ${todayIsoDateString()}.pdf`,
    link: `${apiURL}/businesses/${businessId}/documents/summary`
  }

  const blob = await fetchDocuments(summaryDocument.link) // todo: show alert box on error
  if (blob) {
    if (window.navigator && window.navigator['msSaveOrOpenBlob']) {
      window.navigator['msSaveOrOpenBlob'](blob, summaryDocument.filename)
    } else {
      // for other browsers, create a link pointing to the ObjectURL containing the blob
      const url = window.URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      window.document.body.appendChild(a)
      a.setAttribute('style', 'display: none')
      a.href = url
      a.download = summaryDocument.filename
      a.click()
      window.URL.revokeObjectURL(url)
      a.remove()
    }
  }
}
</script>
