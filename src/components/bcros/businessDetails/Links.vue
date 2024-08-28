<script setup lang="ts">
import { CorpTypeCd, FilingTypes } from '@bcrs-shared-components/enums'
import type { DocumentI } from '~/interfaces/document-i'
import { BusinessStateE } from '~/enums/business-state-e'
import { fetchDocuments, saveBlob } from '~/utils/download-file'

const { currentBusiness, currentBusinessIdentifier, isFirm } = storeToRefs(useBcrosBusiness())
const { getStoredFlag } = useBcrosLaunchdarkly()
const { hasRoleStaff } = useBcrosKeycloak()
const { isAllowedToFile, isDisableNonBenCorps } = useBcrosBusiness()

const isAllowedBusinessSummary = computed(() =>
  !!currentBusinessIdentifier.value &&
  !!getStoredFlag('supported-business-summary-entities')?.includes(currentBusiness.value.legalType)
)

const isPendingDissolution = computed(() => {
  return false
  // todo: implement !!FUTURE not implemented in current dashboard
})

const isChangeBusinessInfoDisabled = computed(() => {
  if (!currentBusiness.value.goodStanding) {
    // todo: add staff exclusion. Staff should not be allowed to skip rules for business
    // as if this is enabled, and not in good standing, only thing that will come is popup warning
    return false
  }

  const isAllowed =
    // if it's coop
    (currentBusiness.value.legalType === CorpTypeCd.COOP &&
      !!getStoredFlag('special-resolution-ui-enabled') &&
      isAllowedToFile(FilingTypes.SPECIAL_RESOLUTION)) ||
    // if it's firm
    (isFirm && isAllowedToFile(FilingTypes.CHANGE_OF_REGISTRATION)) ||

    // otherwise
    isAllowedToFile(FilingTypes.ALTERATION)

  return !isAllowed
})

/**
 * If business is Not In Good Standing and user isn't staff, emits an event to display NIGS dialog.
 * Otherwise, navigates to Edit UI to create a Special Resolution or Change or Alteration filing.
 */
const promptChangeBusinessInfo = () => {
  const baseUrl = useRuntimeConfig().public.editApiURL
  const editUrl = `${baseUrl}/${currentBusinessIdentifier.value}`

  if (!currentBusiness.value.goodStanding && hasRoleStaff) {
    alert('change company info')
    // this.emitNotInGoodStanding(NigsMessage.CHANGE_COMPANY_INFO)
  } else if (currentBusiness.value.legalType === CorpTypeCd.COOP) {
    navigateTo(`${editUrl}/special-resolution`, { external: true })
  } else if (isFirm) {
    navigateTo(`${editUrl}/change`, { external: true })
  } else {
    navigateTo(`${editUrl}/alteration`, { external: true })
  }
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
    saveBlob(blob, summaryDocument.filename)
  }
}
</script>

<template>
  <div class="flex flex-row gap-3 items-center">
    <!--    staff comments todo: -->
    <!-- COLIN link button -->
    <span
      v-if="!!currentBusinessIdentifier && isDisableNonBenCorps()"
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
          data-cy="button.colinLink"
          @click="navigateTo('https://www.corporateonline.gov.bc.ca/', { external: true})"
        >
          <span class="font-13 ml-1">{{ $t('button.tombstone.colinLink') }}</span>
        </UButton>
      </BcrosTooltip>
    </span>

    <!-- View and Change Business Information -->
    <span
      v-if="!isDisableNonBenCorps() &&
        !!currentBusinessIdentifier &&
        currentBusiness.state !== BusinessStateE.HISTORICAL"
    >
      <UButton
        id="business-information-button"
        small
        text
        color="primary"
        variant="ghost"
        :disabled="isChangeBusinessInfoDisabled"
        class="w-full text-nowrap"
        leading-icon="i-mdi-file-document-edit-outline"
        data-cy="button.viewAndChangeBusinessInfo"
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
    <span v-if="!isDisableNonBenCorps() && isAllowedBusinessSummary">
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
          data-cy="button.downloadSummary"
          @click="downloadBusinessSummary"
        >
          <template #leading>
            <img
              src="@/assets/images/business_summary_icon.svg"
              alt=""
              class="pa-1"
            >
          </template>
          <span class="font-13 ml-1 text-nowrap">{{ $t('button.tombstone.businessSummary') }}</span>
        </UButton>
      </BcrosTooltip>
    </span>

    <div class="mb-2">
      <BcrosBusinessDetailsLinkActions v-if="!!currentBusinessIdentifier && !isDisableNonBenCorps()" />
    </div>
  </div>
</template>
