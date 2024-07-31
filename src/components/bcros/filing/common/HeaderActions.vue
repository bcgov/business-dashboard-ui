<template>
  <div class="flex flex-row items-center">
    <!-- the main button -->
    <UButton
      class="expand-btn"
      :class="{ 'bootstrap-filing': isBootstrapFiling }"
      variant="ghost"
      color="primary"
      :ripple="false"
      @click="isExpanded = !isExpanded"
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
      v-if="!isDisableNonBenCorps() && isRoleStaff && isBusiness"
      :items="actions"
      :popper="{ placement: 'bottom-end' }"
      :ui="{
      container: 'bg-blue-500 w-auto'
    }"
      padding="p3"
      data-cy="header.actions.dropdown"
    >
      <UButton variant="ghost" label=" " trailing-icon="i-mdi-chevron-down" />
    </UDropdown>
  </div>
</template>

<script setup lang="ts">
import { type ApiResponseFilingI, FilingStatusE, isFilingStatus, isStaffFiling } from '#imports'
import { FilingTypes } from '@bcrs-shared-components/enums'

const { getStoredFlag } = useBcrosLaunchdarkly()
const { isRoleStaff } = storeToRefs(useBcrosKeycloak())
const { isAllowedToFile, isBaseCompany, isDisableNonBenCorps, isEntityCoop, isEntityFirm } = useBcrosBusiness()
const { currentBusiness } = storeToRefs(useBcrosBusiness())

const isExpanded = defineModel('isExpanded', { type: Boolean, required: true })

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const t = useNuxtApp().$i18n.t

const isTypeStaff = computed(() => isStaffFiling(props.filing))

/** Whether this entity is a business (and not a temporary registration). */
// todo: how do we handle stuff that is in session storage
// const isBusiness = !!sessionStorage.getItem('BUSINESS_ID')
const isBusiness = !!currentBusiness.value.identifier

/**
 * Whether to disable correction for THIS filing.
 * (This is function instead of a getter so that we always query the realtime FF.)
 */
const disableCorrection = (): boolean => {
  // disable if not allowed
  const isAllowed =
    !!getStoredFlag('supported-correction-entities')?.includes(currentBusiness.value.legalType) &&
    isAllowedToFile(FilingTypes.CORRECTION)
  if (!isAllowed) {
    return true
  }

  // disable if filing is paper-only
  if (props.filing.availableOnPaperOnly) {
    return true
  }

  // disable if filing is future effective but is not completed or corrected
  if (
    props.filing.isFutureEffective &&
    !(isFilingStatus(props.filing, FilingStatusE.COMPLETED) || isFilingStatus(props.filing, FilingStatusE.CORRECTED))
  ) {
    return true
  }

  switch (true) {
    case isFilingType(props.filing, FilingTypes.ADMIN_FREEZE):
      return true // staff filing not allowed
    case isFilingType(props.filing, FilingTypes.ALTERATION):
      return false
    case isFilingType(props.filing, FilingTypes.AGM_EXTENSION):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.AGM_LOCATION_CHANGE):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.AMALGAMATION_APPLICATION):
      // disable if not a base company (safety check for filing compatibility)
      return !isBaseCompany
    case isFilingType(props.filing, FilingTypes.AMALGAMATION_OUT):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.ANNUAL_REPORT):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.CHANGE_OF_ADDRESS):
      return false
    case isFilingType(props.filing, FilingTypes.CHANGE_OF_COMPANY_INFO):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.CHANGE_OF_DIRECTORS):
      return false
    case isFilingType(props.filing, FilingTypes.CHANGE_OF_NAME):
      return false
    case isFilingType(props.filing, FilingTypes.CHANGE_OF_REGISTRATION):
      // disable if not a firm (safety check for filing compatibility)
      return !isEntityFirm
    case isFilingType(props.filing, FilingTypes.CONSENT_AMALGAMATION_OUT):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.CONSENT_CONTINUATION_OUT):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.CONTINUATION_IN):
      // disable if not a base company (safety check for filing compatibility)
      return !isBaseCompany
    case isFilingType(props.filing, FilingTypes.CONTINUATION_OUT):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.CONVERSION):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.CORRECTION):
      // disable if not a firm, base company, or coop (safety check for filing compatibility)
      return !isEntityFirm && !isBaseCompany && !isEntityCoop
    case isFilingType(props.filing, FilingTypes.COURT_ORDER):
      return true // staff filing not allowed
    case isFilingType(props.filing, FilingTypes.DISSOLUTION):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.DISSOLVED):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.INCORPORATION_APPLICATION):
      // disable if not a base company or coop (safety check for filing compatibility)
      return !isBaseCompany && !isEntityCoop
    case isFilingType(props.filing, FilingTypes.PUT_BACK_ON):
      return true // staff filing not allowed
    case isFilingType(props.filing, FilingTypes.REGISTRATION):
      // disable if not a firm (safety check for filing compatibility)
      return !isEntityFirm
    case isFilingType(props.filing, FilingTypes.REGISTRARS_NOTATION):
      return true // staff filing not allowed
    case isFilingType(props.filing, FilingTypes.REGISTRARS_ORDER):
      return true // staff filing not allowed
    case isFilingType(props.filing, undefined, FilingSubTypeE.FULL_RESTORATION):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.SPECIAL_RESOLUTION):
      return true // not supported
    case isFilingType(props.filing, FilingTypes.TRANSITION):
      return true // not supported
  }

  // eslint-disable-next-line no-console
  console.log('disableCorrection(), unhandled filing =', props.filing)

  return true // safe fallback
}

/** Called by File a Correction button to correct the subject filing. */
const correctThisFiling = async (): Promise<void> => {
  // filing: ApiResponseFilingI1 = props.filing
  // show file correction dialog, which will then route to Edit UI
  // this.setCurrentFiling(filing)
  // setFileCorrectionDialog(true) todo: will be done in ticket #22550
}

const showCommentDialog = () => {
  // todo: will be done in ticket #22550
}

const actions: any[] = [
  {
    label: t('button.filing.actions.fileACorrection'),
    click: correctThisFiling,
    disabled: disableCorrection(),
    icon: 'i-mdi-file-document-edit-outline'
  },
  {
    label: t('button.filing.actions.addDetail'),
    click: showCommentDialog,
    disabled: !(isBusiness && isRoleStaff),
    icon: 'i-mdi-comment-plus'
  }
]
</script>
