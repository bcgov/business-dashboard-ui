<script setup lang="ts">
import { CorpTypeCd, FilingTypes } from '@bcrs-shared-components/enums'
import type { DocumentI } from '~/interfaces/document-i'
import { BusinessStateE } from '~/enums/business-state-e'
import { fetchDocuments, saveBlob } from '~/utils/download-file'

const { currentBusiness, comments, currentBusinessIdentifier, isFirm, businessConfig } = storeToRefs(useBcrosBusiness())
const { getStoredFlag } = useBcrosLaunchdarkly()
const { hasRoleStaff } = useBcrosKeycloak()
const { isAllowedToFile, isDisableNonBenCorps } = useBcrosBusiness()
const isCommentOpen = ref(false)
const isDissolutionDialogOpen = ref(false)

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

const legalName = computed(() => currentBusiness.value?.legalName)
// TO-DO: in the old codebase, the legalName is returned by the getLegalName() function.
// Need to investigate the logic and implement it in business store in ticket #23493

// /** The legal name or alternate name if is firm. */
// getLegalName (state: BusinessStateIF): string {
//   const rootStore = useRootStore()

//   if (!GetFeatureFlag('enable-legal-name-fix')) {
//     return state.businessInfo.legalName
//   }
//   if (this.isEntityFirm && !rootStore.isRegistrationTodo && !rootStore.isRegistrationFiling) {
//     return this.getAlternateName
//   } else {
//     return state.businessInfo.legalName
//   }
// },

// /** The alternate name. */
// getAlternateName (state: BusinessStateIF): string {
//   const { alternateNames, identifier } = state.businessInfo
//   const name = alternateNames?.find((x) => x.identifier === identifier)?.name
//   return name || null
// },

const showCommentDialog = (show: boolean) => {
  isCommentOpen.value = show
}

const showDissolutionDialog = (show: boolean) => {
  isDissolutionDialogOpen.value = show
}

const dissolutionDialogOptions = computed<DialogOptionsI>(() => {
  const title = businessConfig.value?.dissolutionConfirmation.modalTitle
  return {
    title,
    text: '', // content slot is used
    hideClose: false,
    buttons: [] as DialogButtonI[], // button slot is used
    alertIcon: true
  }
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

/** Creates a draft filing and navigates to the Create UI to file a company dissolution filing. */
const dissolveBusiness = async (): Promise<void> => {
  // To be implemented in ticket #23467
  await new Promise<void>((resolve) => { resolve() })
}
</script>

<template>
  <div class="flex flex-row gap-3 items-center">
    <!-- Dissolution Confirmation Dialog -->
    <BcrosDialog
      attach="#businessDetails"
      name="confirmDissolution"
      :display="isDissolutionDialogOpen"
      :options="dissolutionDialogOptions"
      @close="showDissolutionDialog(false)"
    >
      <template #content>
        <div>
          You are about to {{ businessConfig?.dissolutionConfirmation.dissolutionType }}
          <strong>{{ legalName || 'this company' }}</strong>;
          once this process is completed and the required documents are filed,
          the {{ businessConfig?.dissolutionConfirmation.entityTitle }} will be
          struck from the register and dissolved, ceasing to be
          {{ businessConfig?.dissolutionConfirmation.subTitle }} under the
          {{ businessConfig?.dissolutionConfirmation.act }} Act.
        </div>
      </template>
      <template #buttons>
        <div class="flex justify-center gap-5">
          <UButton
            variant="outline"
            class="px-10 py-2"
            @click="showDissolutionDialog(false)"
          >
            {{ $t('button.general.cancel') }}
          </UButton>
          <UButton
            class="px-10 py-2"
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
        @dissolve="showDissolutionDialog(true)"
      />
    </div>
  </div>
</template>
