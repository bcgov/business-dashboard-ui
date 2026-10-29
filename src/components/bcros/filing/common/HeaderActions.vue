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

    <!-- the main action button -->
    <UButton
      variant="ghost"
      class="px-3 py-2"
      data-cy="filing-main-action-button"
      @click="handleButtonClick"
    >
      <!-- filings available on paper only show Request a Copy / Close button -->
      <template v-if="filing.availableOnPaperOnly">
        <strong v-if="!isExpanded">{{ $t('button.filing.actions.requestACopy') }}</strong>
        <strong v-else>{{ $t('button.filing.actions.close') }}</strong>
      </template>

      <!-- staff filings, except Court Orders, show View / Hide button -->
      <template v-else-if="isTypeStaff && !isFilingType(filing, FilingTypes.COURT_ORDER)">
        <strong v-if="!isExpanded">{{ $t('button.filing.actions.view') }}</strong>
        <strong v-else>{{ $t('button.filing.actions.hide') }}</strong>
      </template>

      <!-- Court Orders, when not authorized to file them (ie, not staff), show View / Hide button -->
      <template
        v-else-if="isFilingType(filing, FilingTypes.COURT_ORDER) &&
          !isAuthorized(AuthorizedActionsE.COURT_ORDER_FILING)"
      >
        <strong v-if="!isExpanded">{{ $t('button.filing.actions.view') }}</strong>
        <strong v-else>{{ $t('button.filing.actions.hide') }}</strong>
      </template>

      <!-- pending filings show View / Hide button -->
      <template v-else-if="filing.status === FilingStatusE.PENDING">
        <strong v-if="!isExpanded">{{ $t('button.filing.actions.view') }}</strong>
        <strong v-else>{{ $t('button.filing.actions.hide') }}</strong>
      </template>

      <!-- otherwise, assuming there's a documents link, show View Document / Hide Document button -->
      <template v-else-if="filing.documentsLink">
        <strong v-if="!isExpanded">{{ $t('button.filing.actions.viewDocument') }}</strong>
        <strong v-else>{{ $t('button.filing.actions.hideDocuments') }}</strong>
      </template>
    </UButton>

    <!-- the drop-down menu -->
    <UDropdown
      v-if="!isDisableNonBenCorps() && hasAvailableDropDownActions"
      :items="actions"
      :popper="{ placement: 'bottom-end' }"
      padding="p-3"
      data-cy="header.actions.dropdown"
      class="text-blue-500"
    >
      <UButton variant="ghost" label="" trailing-icon="i-mdi-chevron-down" />

      <template #item="{ item }">
        <UButton
          variant="ghost"
          :label="item.label"
          :disabled="item.disabled"
          :data-cy="item.class"
          :icon="item.image ? undefined : item.icon"
          :ui="{ padding: { sm: 'p-0' } }"
          class="w-full text-nowrap"
          @click.stop="item.click"
        >
          <template v-if="item.image" #leading>
            <img :src="item.image" alt="" class="w-4 h-4">
          </template>
        </UButton>
      </template>
    </UDropdown>
    <UModal v-model="isCommentOpen" :ui="{base: 'absolute left-10 top-5 bottom-5'}">
      <BcrosComment :comments="filing.comments" :filing="filing" @close="showCommentDialog(false)" />
    </UModal>
  </div>
</template>

<script setup lang="ts">
import { FilingTypes } from '@bcrs-shared-components/enums'
import { z } from 'zod'
import { storeToRefs } from 'pinia'
import {
  type ApiResponseFilingI,
  FilingStatusE,
  isFilingStatus,
  isStaffFiling,
  isFutureEffective,
  useBcrosDocuments,
  AuthorizedActionsE,
  isAuthorized
} from '#imports'
import { FilingCorrectionTypesE } from '~/enums/filing-correction-types-e'
import { LDFlags } from '~/enums/ld-flags'
import continueOutIcon from '@/assets/images/continue_out_icon.svg'
import amalgamationOutIcon from '@/assets/images/amalgamation_out_icon.svg'

const { getStoredFlag } = useBcrosLaunchdarkly()
const { isAllowed, isAllowedToFile, isDisableNonBenCorps } = useBcrosBusiness()
const { isActionVisible } = useBcrosDashboardActions()
const { currentBusiness, isEntityCoop, isBaseCompany, isEntityFirm } = storeToRefs(useBcrosBusiness())
const { bootstrapFiling } = storeToRefs(useBcrosBusinessBootstrap())
const { isBootstrapFiling } = useBcrosBusinessBootstrap()
const { goToBusinessCorpsUI, goToEditUI, goToFilingsUI } = useBcrosNavigate()
const ui = useBcrosDashboardUi()
const { getCorpDocuments } = useBcrosDocuments()
const { documents, enableDocumentRecords } = storeToRefs(useBcrosDocuments())

const isCommentOpen = ref(false)
const filings = useBcrosFilings()
const isExpanded = defineModel('isExpanded', { type: Boolean, required: true })
const showFilingModal = ref(false)

const filing = defineModel('filing', { type: Object as PropType<ApiResponseFilingI>, required: true })

const t = useNuxtApp().$i18n.t

const currentBusinessIdentifier = computed(() => currentBusiness.value?.identifier)
const tempBusinessIdentifier = computed(() => bootstrapFiling.value.filing.business.identifier)
const filingId = computed(() => filing.value.filingId)
const isTypeStaff = computed(() => isStaffFiling(filing.value))
const isFutureEffectiveFiling = computed(() => isFutureEffective(filing.value))
const isWithdrawalPending = computed(() => filing.value.withdrawalPending)

const supportedFilingsFFConfig = computed(() => getStoredFlag(LDFlags.SupportedFilingsConfig))
const config = computed(() => getSupportedFilingsConfig(
  filing.value.name,
  filing.value.filingSubType,
  supportedFilingsFFConfig.value
))

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
  const { correction: correctionTarget, filing: filingTarget } = config.value

  // special case for correcting a correction only
  // need to check if filing type is allowed instead of is correction allowed
  const redirectTarget = isFilingType(filing.value, FilingTypes.CORRECTION) ? filingTarget : correctionTarget

  if (!redirectTarget || redirectTarget === 'off') {
    return
  }

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
      correctedFilingDate: dateToYyyyMmDd(new Date(filing.value.paymentDate || filing.value.submittedDate)),
      correctedFilingId: filingId.value,
      correctedFilingType: filing.value.name,
      correctedFilingSubType: filing.value.filingSubType,
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

  if (redirectTarget === 'modern' && isBaseCompany.value) {
    goToBusinessCorpsUI(`/correction/${currentBusinessIdentifier.value}/${draftFilingId}`)
  } else {
    const path = `/${currentBusinessIdentifier.value}/correction/`
    const params = { 'correction-id': draftFilingId }
    goToEditUI(path, params)
  }

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
  const { correction } = config.value

  // disable if specifically configured off
  if (!correction || correction === 'off') {
    return true
  }

  // disable if not allowed
  const isAllowed =
    !!getStoredFlag(LDFlags.SupportedCorrectionEntities)?.includes(currentBusiness.value?.legalType) &&
    isAllowedToFile(FilingTypes.CORRECTION) && isAuthorized(AuthorizedActionsE.CORRECTION_FILING)
  if (!isAllowed) {
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
    // Base company restrictions - (safety check for filing compatibility)
    case isFilingType(filing.value, FilingTypes.AMALGAMATION_APPLICATION):
    case isFilingType(filing.value, FilingTypes.CONTINUATION_IN):
      return !isBaseCompany.value

    // Firm restrictions - (safety check for filing compatibility)
    case isFilingType(filing.value, FilingTypes.CHANGE_OF_REGISTRATION):
    case isFilingType(filing.value, FilingTypes.REGISTRATION):
      return !isEntityFirm.value

    // Multi-entity restrictions - (firm, base company, or coop - safety check for filing compatibility)
    case isFilingType(filing.value, FilingTypes.CORRECTION):
      return !isEntityFirm.value && !isBaseCompany.value && !isEntityCoop.value

    case isFilingType(filing.value, FilingTypes.INCORPORATION_APPLICATION):
      return !isBaseCompany.value && !isEntityCoop.value

    // LD flag entity type restrictions
    case isFilingType(filing.value, FilingTypes.ANNUAL_REPORT):
      return !getStoredFlag(LDFlags.SupportedArCorrectionEntities)?.includes(currentBusiness.value?.legalType)

    // Config is either 'legacy' or 'modern' defined in /utils/supported-filings-config
    default:
      return false
  }
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
  goToFilingsUI(path, params)
}

const disableWithdrawal = (): boolean => {
  const ff = getStoredFlag(LDFlags.EnableWithdrawalAction)
  return !(isAuthorized(AuthorizedActionsE.NOTICE_WITHDRAWAL_FILING) &&
           isFutureEffectiveFiling.value && !isWithdrawalPending.value && ff)
}

const isConsentToContinueOutFiling = computed(() =>
  isFilingType(filing.value, FilingTypes.CONSENT_CONTINUATION_OUT)
)

const showContinuationOut = computed(() => {
  return isConsentToContinueOutFiling.value &&
    !!getStoredFlag(LDFlags.SupportedContinuationOutEntities)?.includes(currentBusiness.value?.legalType) &&
    isActionVisible(AllowableActionE.CONTINUATION_OUT) &&
    isAuthorized(AuthorizedActionsE.STAFF_FILINGS)
})

const disableContinuationOut = (): boolean => {
  return !isAllowed(AllowableActionE.CONTINUATION_OUT)
}

const goToContinuationOut = () => {
  const path = `/${currentBusinessIdentifier.value}/continuation-out`
  const params = {
    filingId: '0',
    consentContinuationOutFilingId: filingId.value.toString()
  }
  goToFilingsUI(path, params)
}

const isConsentToAmalgamateOutFiling = computed(() =>
  isFilingType(filing.value, FilingTypes.CONSENT_AMALGAMATION_OUT)
)

const showAmalgamationOut = computed(() => {
  return isConsentToAmalgamateOutFiling.value &&
    !!getStoredFlag(LDFlags.SupportedAmalgamationOutEntities)?.includes(currentBusiness.value?.legalType) &&
    isActionVisible(AllowableActionE.AMALGAMATION_OUT) &&
    isAuthorized(AuthorizedActionsE.STAFF_FILINGS)
})

const disableAmalgamationOut = (): boolean => {
  return !isAllowed(AllowableActionE.AMALGAMATION_OUT)
}

const goToAmalgamationOut = () => {
  const path = `/${currentBusinessIdentifier.value}/amalgamation-out`
  const params = {
    filingId: '0',
    consentAmalgamationOutFilingId: filingId.value.toString()
  }
  goToFilingsUI(path, params)
}

const allDropdownActions = computed(() => [
  {
    label: t('button.filing.actions.fileACorrection'),
    click: correctThisFiling,
    disabled: disableCorrection(),
    icon: 'i-mdi-file-document-edit-outline',
    class: 'fileACorrection',
    showButton: true
  },
  {
    label: t('button.filing.actions.addDetail'),
    click: showCommentDialog,
    disabled: !(isBusiness && isAuthorized(AuthorizedActionsE.DETAIL_COMMENTS)),
    icon: 'i-mdi-comment-plus',
    showButton: true
  },
  {
    label: t('button.filing.actions.fileAWithdrawal'),
    click: goToNoticeOfWithdrawal,
    disabled: disableWithdrawal(),
    icon: 'i-mdi-undo',
    showButton: true
  },
  {
    label: t('button.filing.actions.continueOut'),
    click: goToContinuationOut,
    disabled: disableContinuationOut(),
    image: continueOutIcon,
    showButton: showContinuationOut.value
  },
  {
    label: t('button.filing.actions.amalgamateOut'),
    click: goToAmalgamationOut,
    disabled: disableAmalgamationOut(),
    image: amalgamationOutIcon,
    showButton: showAmalgamationOut.value
  }
])

const actions = computed(() => [allDropdownActions.value.filter(a => a.showButton)])

const hasAvailableDropDownActions = computed(() =>
  !(
    disableCorrection() &&
    !(isBusiness && isAuthorized(AuthorizedActionsE.DETAIL_COMMENTS)) &&
    disableWithdrawal() &&
    (!showContinuationOut.value || disableContinuationOut()) &&
    (!showAmalgamationOut.value || disableAmalgamationOut())
  )
)

const handleButtonClick = async () => {
  // toggle expansion state
  isExpanded.value = !isExpanded.value

  // if the filing has documentsLink but the documents list is empty
  // (i.e., when View More is clicked for the first time), load the documents list
  if (filing.value.documents === undefined && filing.value.documentsLink) {
    ui.fetchingData = true

    await loadDocumentList(filing.value).catch((error) => {
      console.error('Failed to load the document list.', error)
    })

    // If document records are enabled and the documents list is empty,
    // fetch the document records for the current business identifier.
    if (enableDocumentRecords.value && !documents.value?.length) {
      await getCorpDocuments({ consumerIdentifier: currentBusinessIdentifier.value })
    }

    // make the spinner display for another 250ms so it does not flash when the promise resolves quickly
    await sleep(250)

    ui.fetchingData = false
  }
}
</script>
