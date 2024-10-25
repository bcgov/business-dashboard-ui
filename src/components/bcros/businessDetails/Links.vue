<script setup lang="ts">
import { CorpTypeCd, FilingTypes } from '@bcrs-shared-components/enums'
import { FilingSubTypeE } from '~/enums/filing-sub-type-e'
import type { DocumentI } from '~/interfaces/document-i'
import { BusinessStateE } from '~/enums/business-state-e'
import { fetchDocuments, saveBlob } from '~/utils/download-file'
import { getContactInfo } from '#imports'

const t = useNuxtApp().$i18n.t
const {
  currentBusiness,
  comments,
  currentBusinessIdentifier,
  currentBusinessName,
  isFirm,
  businessConfig,
  currentBusinessAddresses
} = storeToRefs(useBcrosBusiness())
const { getStoredFlag } = useBcrosLaunchdarkly()
const { hasRoleStaff } = useBcrosKeycloak()
const { isAllowedToFile, isDisableNonBenCorps } = useBcrosBusiness()
const isCommentOpen = ref(false)
const isDissolutionDialogOpen = ref(false)
const { goToCreatePage } = useBcrosNavigate()
const filings = useBcrosFilings()

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

const showCommentDialog = (show: boolean) => {
  isCommentOpen.value = show
}

const setShowDissolutionDialog = (show: boolean) => {
  showDissolutionText.value = true
  isDissolutionDialogOpen.value = show
}

const dissolutionDialogOptions = computed<DialogOptionsI>(() => {
  const title = currentBusiness?.value?.goodStanding || hasRoleStaff
    ? businessConfig.value?.dissolutionConfirmation.modalTitle
    : t('title.dialog.notGoodStanding.notInGoodStanding')
  return {
    title,
    text: '', // content slot is used
    hideClose: false,
    buttons: [] as DialogButtonI[], // button slot is used
    alertIcon: true
  }
})

const showDissolutionText = ref(true)
const showChangeNotInGoodStandingDialog = ref(false)
const setShowChangeNotInGoodStandingDialog = (show: boolean) => {
  showChangeNotInGoodStandingDialog.value = show
}

const closeNotGoodStandingDialog = () => {
  if (isDissolutionDialogOpen.value) {
    setShowDissolutionDialog(false)
  } else {
    setShowChangeNotInGoodStandingDialog(false)
  }
}

/**
 * If business is Not In Good Standing and user isn't staff, emits an event to display NIGS dialog.
 * Otherwise, navigates to Edit UI to create a Special Resolution or Change or Alteration filing.
 */
const promptChangeBusinessInfo = () => {
  if (!currentBusiness.value.goodStanding) {
    // show not good standing popup
    showDissolutionText.value = false
    setShowChangeNotInGoodStandingDialog(true)
    return
  }

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

/** Creates a draft filing and navigates to the Create UI to file a company dissolution filing. */
const dissolveBusiness = async (): Promise<void> => {
  const payload = {
    custodialOffice: currentBusinessAddresses.value?.registeredOffice,
    dissolutionType: FilingSubTypeE.DISSOLUTION_VOLUNTARY
  }

  // SP and Partnership use business office instead of registered office
  if (currentBusiness.value.legalType === CorpTypeCd.SOLE_PROP ||
      currentBusiness.value.legalType === CorpTypeCd.PARTNERSHIP) {
    payload.custodialOffice = currentBusinessAddresses.value?.businessOffice
  }

  const response = await filings.createFiling(
    currentBusiness.value,
    FilingTypes.DISSOLUTION,
    payload,
    true
  )

  await new Promise<void>((resolve, reject) => {
    if (response.error?.value) {
      console.error('Filing error', response.error.value)
      reject(new Error('Failed to create filing'))
    } else {
      const filingId = +response.header?.filingId
      if (isNaN(filingId)) {
        console.error('Filing error no filingId')
        reject(new Error('Failed to create filing'))
      }
      goToCreatePage('/dissolution-define-dissolution', { id: currentBusiness.value.identifier })
      resolve()
    }
  })
}

const contacts = getContactInfo('registries')
</script>

<template>
  <div class="flex flex-row gap-3 items-center">
    <!-- Dissolution Confirmation Dialog -->
    <BcrosDialog
      attach="#businessDetails"
      name="confirmDissolution"
      :display="isDissolutionDialogOpen || showChangeNotInGoodStandingDialog"
      :options="dissolutionDialogOptions"
      @close="closeNotGoodStandingDialog"
    >
      <template #content>
        <div v-if="!currentBusiness.goodStanding && !hasRoleStaff">
          <p>
            {{ showDissolutionText
              ? $t('text.dialog.notGoodStanding.notGoodStanding1')
              : $t('text.dialog.notGoodStanding.changeNotGoodStanding1')
            }}
          </p>
          <p class="my-4">
            {{ showDissolutionText
              ? $t('text.dialog.notGoodStanding.notGoodStanding2')
              : $t('text.dialog.notGoodStanding.changeNotGoodStanding2')
            }}
          </p>
          <BcrosContactInfo :contacts="contacts" />
        </div>
        <div v-else>
          You are about to {{ businessConfig?.dissolutionConfirmation.dissolutionType }}
          <strong>{{ currentBusinessName || 'this company' }}</strong>;
          once this process is completed and the required documents are filed,
          the {{ businessConfig?.dissolutionConfirmation.entityTitle }} will be
          struck from the register and dissolved, ceasing to be
          {{ businessConfig?.dissolutionConfirmation.subTitle }} under the
          {{ businessConfig?.dissolutionConfirmation.act }} Act.
        </div>
      </template>
      <template #buttons>
        <div v-if="!currentBusiness.goodStanding && !hasRoleStaff" class="flex justify-center gap-5">
          <UButton
            variant="outline"
            class="px-10 py-2"
            @click="closeNotGoodStandingDialog"
          >
            {{ $t('button.general.ok') }}
          </UButton>
        </div>
        <div v-else class="flex justify-center gap-5">
          <UButton
            variant="outline"
            class="px-10 py-2"
            @click="closeNotGoodStandingDialog"
          >
            {{ $t('button.general.cancel') }}
          </UButton>
          <UButton
            class="px-10 py-2"
            data-cy="dissolution-button"
            @click="dissolveBusiness"
          >
            {{ businessConfig?.dissolutionConfirmation.confirmButtonText }}
            <UIcon name="i-mdi-chevron-right" class="text-xl" />
          </UButton>
        </div>
      </template>
    </BcrosDialog>
    <!-- Staff Comments -->
    <span v-if="hasRoleStaff" class="h-[26px]">
      <UModal v-model="isCommentOpen" :ui="{base: 'absolute left-10 top-5 bottom-5'}">
        <BcrosComment :comments="comments" :business="currentBusiness.identifier" @close="showCommentDialog(false)" />
      </UModal>
      <UButton
        id="download-summary-button"
        small
        text
        variant="ghost"
        class="w-full text-nowrap"
        data-cy="button.comment"
        @click="showCommentDialog(true)"
      >
        <template #leading>
          <UIcon name="i-mdi-message-reply" size="small" />
        </template>
        <span class="font-13 ml-1 text-nowrap">{{ $t('label.comments.comment', (comments?.length || 0 )) }}</span>
      </UButton>
    </span>
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

    <div class="mb-2 mt-2">
      <BcrosBusinessDetailsLinkActions
        v-if="!!currentBusinessIdentifier && !isDisableNonBenCorps()"
        @dissolve="setShowDissolutionDialog(true)"
      />
    </div>
  </div>
</template>
