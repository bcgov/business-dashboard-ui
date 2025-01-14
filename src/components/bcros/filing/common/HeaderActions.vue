<template>
  <div class="flex flex-row items-center">
    <BcrosDialog
      name="filingModal"
      :display="showFilingModal"
      :options="filingDialogOptions"
      @close="setShowFilingModal(false)"
    >
      <template #content>
        <UAlert
          v-if="filingError !== ''"
          class="text-red-500 text-sm mt-1"
        >
          {{ filingError }}
        </UAlert>
        <p>
          {{ $t('text.dialog.filing.text') }}
        </p>
        <div>
          <UForm ref="correctionForm" :schema="correctionFileSchema" class="pt-3" :state="formState">
            <UFormGroup name="correctionType">
              <URadioGroup
                v-model="formState.correctionType"
                :options="correctionTypes"
                :ui-radio="{ wrapper: 'mb-2' }"
              />
              <template #error="{ error }">
                <p v-if="error" class="text-red-500 text-sm mt-1">
                  {{ $t('text.dialog.filing.validationError') }}
                </p>
              </template>
            </UFormGroup>
          </UForm>
        </div>
      </template>
      <template #buttons>
        <div>
          <UButton
            variant="link"
            @click="setShowFilingModal(false)"
          >
            {{ $t('button.general.cancel') }}
          </UButton>
          <UButton
            class="float-right py-3"
            color="primary"
            data-cy="correctionForm.submit"
            @click="correctionFormSubmit()"
          >
            {{ $t('button.dialog.startCorrection') }}
          </UButton>
        </div>
      </template>
    </BcrosDialog>
    <!-- the main button -->
    <UButton
      variant="ghost"
      class="px-3 py-2"
      data-cy="filing-main-action-button"
      @click="handleButtonClick"
    >
      <template v-if="filing.availableOnPaperOnly">
        <strong v-if="!isExpanded">{{ $t('button.filing.actions.requestACopy') }}</strong>
        <strong v-else>{{ $t('button.filing.actions.close') }}</strong>
      </template>
      <template v-else-if="isTypeStaff">
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
      v-if="!isDisableNonBenCorps() && hasRoleStaff"
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

    <BcrosLoadingModal :open="loadingDocuments" />
  </div>
</template>

<script setup lang="ts">
import { FilingTypes } from '@bcrs-shared-components/enums'
import { z } from 'zod'
import { type ApiResponseFilingI, FilingStatusE, isFilingStatus, isStaffFiling, isFutureEffective } from '#imports'
import { FilingCorrectionTypesE } from '~/enums/filing-correction-types-e'

const { getStoredFlag } = useBcrosLaunchdarkly()
const { hasRoleStaff } = storeToRefs(useBcrosKeycloak())
const { isAllowedToFile, isBaseCompany, isDisableNonBenCorps, isEntityCoop, isEntityFirm } = useBcrosBusiness()
const { currentBusiness } = storeToRefs(useBcrosBusiness())
const { bootstrapFiling } = storeToRefs(useBcrosBusinessBootstrap())
const { isBootstrapFiling } = useBcrosBusinessBootstrap()
const { goToFilingUI, goToEditPage } = useBcrosNavigate()
const ui = useBcrosDashboardUi()

const isCommentOpen = ref(false)
const filings = useBcrosFilings()
const isExpanded = defineModel('isExpanded', { type: Boolean, required: true })
const showFilingModal = ref(false)

const filing = defineModel('filing', { type: Object as PropType<ApiResponseFilingI>, required: true })

const t = useNuxtApp().$i18n.t

const currentBusinessIdentifier = computed(() => currentBusiness.value.identifier)
const tempBusinessIdentifier = computed(() => bootstrapFiling.value.filing.business.identifier)
const filingId = computed(() => filing.value.filingId)
const isTypeStaff = computed(() => isStaffFiling(filing.value))
const isFutureEffectiveFiling = computed(() => isFutureEffective(filing.value))

const setShowFilingModal = (value: boolean) => {
  showFilingModal.value = value
}

const formState = ref({
  correctionType: null
})
const correctionForm = ref()
const submissionInProgress = ref(false)
const filingError = ref('')
const correctionTypes = [
  { value: FilingCorrectionTypesE.CLIENT, label: t('button.filing.correction.client') },
  { value: FilingCorrectionTypesE.STAFF, label: t('button.filing.correction.staff') }
]
const correctionFormSubmit = async function () {
  submissionInProgress.value = true
  const valid = await correctionForm.value.validate(null, { silent: true })
  if (valid === false) {
    return
  }

  const correctionType = formState.value.correctionType

  const response = await filings.createFiling(
    currentBusiness.value,
    FilingTypes.CORRECTION,
    {
      comment: '',
      correctedFilingDate: dateToYyyyMmDd(new Date(filing.value.submittedDate)),
      correctedFilingId: filingId.value,
      correctedFilingType: filing.value.name,
      type: correctionType
    },
    true
  )
  submissionInProgress.value = false
  if (response.error?.value) {
    console.error(response.error.value)
    filingError.value = response.error.value
    return
  }
  filingError.value = ''
  const draftFilingId = response.data?.value?.filing?.header?.filingId
    ? response.data?.value?.filing?.header?.filingId + ''
    : null
  if (!draftFilingId) {
    filingError.value = 'Unable to get correction filing id'
    return
  }
  const path = `/${currentBusinessIdentifier.value}/correction/`
  const params = { 'correction-id': draftFilingId }
  goToEditPage(path, params)

  setShowFilingModal(false)
}

const correctionFileSchema = z.object({
  correctionType: z.nativeEnum(FilingCorrectionTypesE)
})

const filingDialogOptions = computed<DialogOptionsI>(() => {
  const title = t('title.dialog.correction')
  return {
    title,
    text: '', // content slot is used
    hideClose: true,
    buttons: [] as DialogButtonI[], // button slot is used
    alertIcon: false,
    headerLeft: true
  }
})

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
      // enable AR corrections for specified legal types only
      if (getStoredFlag('supported-ar-correction-entities').includes(currentBusiness.value?.legalType)) {
        return false
      }
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
const correctThisFiling = () => {
  setShowFilingModal(true)
}

const showCommentDialog = (show?: boolean) => {
  if (typeof show !== 'boolean') {
    show = true
  }

  isCommentOpen.value = show
}

const goToNoticeOfWithdrawal = () => {
  const businessIdentifier = isBootstrapFiling ? tempBusinessIdentifier.value : currentBusinessIdentifier.value
  const path = `/${businessIdentifier}/notice-of-withdrawal/`
  const params = {
    filingToBeWithdrawn: filingId.value.toString(),
    filingId: '0'
  }
  goToFilingUI(path, params)
}

const actions: any[][] = [[
  {
    label: t('button.filing.actions.fileACorrection'),
    click: correctThisFiling,
    disabled: disableCorrection(),
    icon: 'i-mdi-file-document-edit-outline',
    class: 'fileACorrection'
  },
  {
    label: t('button.filing.actions.addDetail'),
    click: showCommentDialog,
    disabled: !(isBusiness && hasRoleStaff),
    icon: 'i-mdi-comment-plus'
  },
  {
    label: t('button.filing.actions.fileAWithdrawal'),
    click: goToNoticeOfWithdrawal,
    disabled: !(hasRoleStaff && isFutureEffectiveFiling.value),
    icon: 'i-mdi-undo'
  }
]]

const handleButtonClick = async () => {
  // toggle expansion state
  isExpanded.value = !isExpanded.value

  // if the filing has documentsLink but the documents list is empty
  // (i.e., when View More is clicked for the first time), load the documents list
  if (filing.value.documents === undefined && filing.value.documentsLink) {
    ui.fetchingData = true

    await loadDocumentList(filing.value).catch((error) => {
      console.error('Failed to load the document list.', error)
      // TO-DO: #25125 - show the download error dialog
    })

    // make the spinner display for another 250ms so it does not flash when the promise resolves quickly
    await sleep(250)

    ui.fetchingData = false
  }
}
</script>
