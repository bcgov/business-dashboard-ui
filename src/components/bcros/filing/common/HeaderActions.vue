<template>
  <div class="flex flex-row items-center">
    <!-- the main button -->
    <UButton
      v-if="!isBootstrapFiling || !isExpanded"
      variant="ghost"
      class="px-3 py-2"
      data-cy="filing-main-action-button"
      @click="handleButtonClick"
    >
      <template v-if="filing.availableOnPaperOnly">
        <strong v-if="!isExpanded">{{ $t('button.filing.actions.requestACopy') }}</strong>
        <strong v-else>{{ $t('button.filing.actions.close') }}</strong>
      </template>
      <template v-else-if="isTypeStaff || isBootstrapFiling">
        <strong v-if="!isExpanded">{{ $t('button.filing.actions.view') }}</strong>
        <strong v-else>{{ $t('button.filing.actions.hide') }}</strong>
      </template>
      <template v-else-if="filing.documentsLink">
        <strong v-if="!isExpanded">{{ $t('button.filing.actions.viewDocument') }}</strong>
        <strong v-else>{{ $t('button.filing.actions.hideDocuments') }}</strong>
      </template>
    </UButton>

    <!-- the drop-down menu -->
    <UDropdown
      v-if="!isDisableNonBenCorps() && hasRoleStaff && isBusiness"
      :items="actions"
      :popper="{ placement: 'bottom-end' }"
      padding="p-3"
      data-cy="header.actions.dropdown"
      class="text-blue-500"
    >
      <UButton variant="ghost" label="" trailing-icon="i-mdi-chevron-down" />
    </UDropdown>
    <UModal v-model="isCommentOpen" :ui="{base: 'absolute left-10 top-5 bottom-5'}">
      <BcrosComment :comments="filing.comments" :filing="filing" @close="showCommentDialog(false)" />
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { FilingTypes } from '@bcrs-shared-components/enums'
import { type ApiResponseFilingI, FilingStatusE, isFilingStatus, isStaffFiling } from '#imports'

const { getStoredFlag } = useBcrosLaunchdarkly()
const { hasRoleStaff } = storeToRefs(useBcrosKeycloak())
const { isAllowedToFile, isBaseCompany, isDisableNonBenCorps, isEntityCoop, isEntityFirm } = useBcrosBusiness()
const { currentBusiness } = storeToRefs(useBcrosBusiness())
const { isBootstrapFiling } = useBcrosBusinessBootstrap()

const isCommentOpen = ref(false)

const isExpanded = defineModel('isExpanded', { type: Boolean, required: true })

const filing = defineModel('filing', { type: Object as PropType<ApiResponseFilingI>, required: true })

const t = useNuxtApp().$i18n.t

const isTypeStaff = computed(() => isStaffFiling(filing.value))

/** Whether this entity is a business (and not a temporary registration). */
// todo: how do we handle stuff that is in session storage
// const isBusiness = !!sessionStorage.getItem('BUSINESS_ID')
const isBusiness = !!currentBusiness.value?.identifier

/**
 * Whether to disable correction for THIS filing.
 * (This is function instead of a getter so that we always query the realtime FF.)
 */
const disableCorrection = (): boolean => {
  // disable if not allowed
  const isAllowed =
    !!getStoredFlag('supported-correction-entities')?.includes(currentBusiness.value?.legalType) &&
    isAllowedToFile(FilingTypes.CORRECTION)
  if (!isAllowed) {
    return true
  }

  // disable if filing is paper-only
  if (filing.value.availableOnPaperOnly) {
    return true
  }

  // disable if filing is future effective but is not completed or corrected
  if (
    filing.value.isFutureEffective &&
    !(isFilingStatus(filing.value, FilingStatusE.COMPLETED) || isFilingStatus(filing.value, FilingStatusE.CORRECTED))
  ) {
    return true
  }

  switch (true) {
    case isFilingType(filing.value, FilingTypes.ADMIN_FREEZE):
      return true // staff filing not allowed
    case isFilingType(filing.value, FilingTypes.ALTERATION):
      return false
    case isFilingType(filing.value, FilingTypes.AGM_EXTENSION):
      return true // not supported
    case isFilingType(filing.value, FilingTypes.AGM_LOCATION_CHANGE):
      return true // not supported
    case isFilingType(filing.value, FilingTypes.AMALGAMATION_APPLICATION):
      // disable if not a base company (safety check for filing compatibility)
      return !isBaseCompany
    case isFilingType(filing.value, FilingTypes.AMALGAMATION_OUT):
      return true // not supported
    case isFilingType(filing.value, FilingTypes.ANNUAL_REPORT):
      return true // not supported
    case isFilingType(filing.value, FilingTypes.CHANGE_OF_ADDRESS):
      return false
    case isFilingType(filing.value, FilingTypes.CHANGE_OF_COMPANY_INFO):
      return true // not supported
    case isFilingType(filing.value, FilingTypes.CHANGE_OF_DIRECTORS):
      return false
    case isFilingType(filing.value, FilingTypes.CHANGE_OF_NAME):
      return false
    case isFilingType(filing.value, FilingTypes.CHANGE_OF_REGISTRATION):
      // disable if not a firm (safety check for filing compatibility)
      return !isEntityFirm
    case isFilingType(filing.value, FilingTypes.CONSENT_AMALGAMATION_OUT):
      return true // not supported
    case isFilingType(filing.value, FilingTypes.CONSENT_CONTINUATION_OUT):
      return true // not supported
    case isFilingType(filing.value, FilingTypes.CONTINUATION_IN):
      // disable if not a base company (safety check for filing compatibility)
      return !isBaseCompany
    case isFilingType(filing.value, FilingTypes.CONTINUATION_OUT):
      return true // not supported
    case isFilingType(filing.value, FilingTypes.CONVERSION):
      return true // not supported
    case isFilingType(filing.value, FilingTypes.CORRECTION):
      // disable if not a firm, base company, or coop (safety check for filing compatibility)
      return !isEntityFirm && !isBaseCompany && !isEntityCoop
    case isFilingType(filing.value, FilingTypes.COURT_ORDER):
      return true // staff filing not allowed
    case isFilingType(filing.value, FilingTypes.DISSOLUTION):
      return true // not supported
    case isFilingType(filing.value, FilingTypes.DISSOLVED):
      return true // not supported
    case isFilingType(filing.value, FilingTypes.INCORPORATION_APPLICATION):
      // disable if not a base company or coop (safety check for filing compatibility)
      return !isBaseCompany && !isEntityCoop
    case isFilingType(filing.value, FilingTypes.PUT_BACK_ON):
      return true // staff filing not allowed
    case isFilingType(filing.value, FilingTypes.REGISTRATION):
      // disable if not a firm (safety check for filing compatibility)
      return !isEntityFirm
    case isFilingType(filing.value, FilingTypes.REGISTRARS_NOTATION):
      return true // staff filing not allowed
    case isFilingType(filing.value, FilingTypes.REGISTRARS_ORDER):
      return true // staff filing not allowed
    case isFilingType(filing.value, undefined, FilingSubTypeE.FULL_RESTORATION):
      return true // not supported
    case isFilingType(filing.value, FilingTypes.SPECIAL_RESOLUTION):
      return true // not supported
    case isFilingType(filing.value, FilingTypes.TRANSITION):
      return true // not supported
  }

  console.info('disableCorrection(), unhandled filing =', filing.value)

  return true // safe fallback
}

/** Called by File a Correction button to correct the subject filing. */
const correctThisFiling = async (): Promise<void> => {
  // filing: ApiResponseFilingI1 = props.filing
  // show file correction dialog, which will then route to Edit UI
  // this.setCurrentFiling(filing)
  // setFileCorrectionDialog(true) todo: will be done in ticket #22550
}

const showCommentDialog = (show?: boolean) => {
  if (typeof show !== 'boolean') {
    show = true
  }

  isCommentOpen.value = show
}

const actions: any[][] = [[
  {
    label: t('button.filing.actions.fileACorrection'),
    click: correctThisFiling,
    disabled: disableCorrection(),
    icon: 'i-mdi-file-document-edit-outline'
  },
  {
    label: t('button.filing.actions.addDetail'),
    click: showCommentDialog,
    disabled: !(isBusiness && hasRoleStaff),
    icon: 'i-mdi-comment-plus'
  }
]]

const handleButtonClick = () => {
  // toggle expansion state
  isExpanded.value = !isExpanded.value

  // if the filing has documentsLink but the documents list is empty
  // (i.e., when View More is clicked for the first time), load the documents list
  if (filing.value.documents === undefined && filing.value.documentsLink) {
    loadDocumentList(filing.value)
  }
}
</script>
