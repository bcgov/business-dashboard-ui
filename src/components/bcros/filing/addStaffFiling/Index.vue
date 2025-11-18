<script lang="ts" setup>
import type { DropdownItem } from '#ui/types'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { LDFlags } from '~/enums/ld-flags'
import { FilingSubTypeE } from '~/enums/filing-sub-type-e'

const t = useNuxtApp().$i18n.t

interface MenuActionItem extends DropdownItem {
  showButton: boolean,
  datacy: string
}

const filings = useBcrosFilings()
const business = useBcrosBusiness()
const { getStoredFlag } = useBcrosLaunchdarkly()
const { isActionVisible } = useBcrosDashboardActions()
const { currentBusiness } = storeToRefs(business)
const { goToCreateUI, goToEditUI, goToFilingsUI, goToPersonRolesUI } = useBcrosNavigate()

const openFreezeUnfreezeModal = ref(false)
const openRegistrarNotationModal = ref(false)
const openRegistrarOrderModal = ref(false)
const openCourtOrderModal = ref(false)
const openDissolutionModal = ref(false)
const openPutBackOnModal = ref(false)

const emit = defineEmits(['saveLocalFilingEmit'])

const saveEmitForPolling = () => {
  emit('saveLocalFilingEmit')
}
// Create a restoration filing and navigate to the appropriate page
const restoreCompany = async (restorationType: FilingSubTypeE = null) => {
  // create restoration filing
  const response: any = await filings.createFiling(
    currentBusiness.value,
    FilingTypes.RESTORATION,
    { type: restorationType },
    true
  )

  if (response.error?.value) {
    console.error(response.error.value)
    return
  }

  const filingId: number = response.data?.value.filing.header.filingId

  // navigate to Edit UI for limited restoration extension filing
  // navigate to Edit UI for limited restoration to full filing
  // navigate to Create UI for full or limited restoration filing
  if (restorationType === FilingSubTypeE.LIMITED_RESTORATION_EXTENSION) {
    goToEditUI(`/${currentBusiness.value.identifier}/limitedRestorationExtension`,
      { 'restoration-id': filingId.toString() })
  } else if (restorationType === FilingSubTypeE.LIMITED_RESTORATION_TO_FULL) {
    goToEditUI(`/${currentBusiness.value.identifier}/limitedRestorationToFull`,
      { 'restoration-id': filingId.toString() })
  } else {
    goToCreateUI('/restoration-business-name', { id: currentBusiness.value.identifier })
  }
}

const allActions: ComputedRef<Array<MenuActionItem>> = computed(() => {
  return [
    { // <!-- Registrar Notation -->
      showButton:
        isActionVisible(AllowableActionE.REGISTRARS_NOTATION) &&
        isAuthorized(AuthorizedActionsE.STAFF_FILINGS),
      disabled: !business.isAllowed(AllowableActionE.REGISTRARS_NOTATION),
      datacy: 'registrar-notation',
      label: t('label.filing.staffFilingOptions.registrarsNotation'),
      click: () => { openRegistrarNotationModal.value = true }
    },
    { // <!-- Registrar Order -->
      showButton:
        isActionVisible(AllowableActionE.REGISTRARS_ORDER) &&
        isAuthorized(AuthorizedActionsE.STAFF_FILINGS),
      disabled: !business.isAllowed(AllowableActionE.REGISTRARS_ORDER),
      datacy: 'registrar-order',
      label: t('label.filing.staffFilingOptions.registrarsOrder'),
      click: () => { openRegistrarOrderModal.value = true }
    },
    { // <!-- Court Order -->
      showButton:
        isActionVisible(AllowableActionE.COURT_ORDER) &&
        isAuthorized(AuthorizedActionsE.COURT_ORDER_FILING),
      disabled: !business.isAllowed(AllowableActionE.COURT_ORDER),
      datacy: 'court-order',
      label: t('label.filing.staffFilingOptions.courtOrder'),
      click: () => {
        goToFilingsUI(`/${currentBusiness.value.identifier}/court-order`, { filingId: '0' })
      }
    },
    { // <!-- Record Conversion -->
      showButton:
        isActionVisible(AllowableActionE.RECORD_CONVERSION) &&
        isAuthorized(AuthorizedActionsE.FIRM_CONVERSION_FILING),
      disabled: !business.isAllowed(AllowableActionE.RECORD_CONVERSION),
      datacy: 'record-conversion',
      label: t('label.filing.staffFilingOptions.recordConversion'),
      click: () => {
        goToEditUI(`/${currentBusiness.value.identifier}/conversion`)
      }
    },
    { // <!-- Admin Dissolution -->
      showButton:
        isActionVisible(AllowableActionE.ADMINISTRATIVE_DISSOLUTION) &&
        isAuthorized(AuthorizedActionsE.ADMIN_DISSOLUTION_FILING),
      disabled: !business.isAllowed(AllowableActionE.ADMINISTRATIVE_DISSOLUTION),
      datacy: 'dissolution',
      label: t('label.filing.staffFilingOptions.dissolution'),
      click: () => { openDissolutionModal.value = true }
    },
    { // <!-- Restore Company  -->
      showButton:
        isActionVisible(AllowableActionE.RESTORATION) &&
        isAuthorized(AuthorizedActionsE.RESTORATION_REINSTATEMENT_FILING),
      disabled: !business.isAllowed(AllowableActionE.RESTORATION),
      datacy: 'restore',
      label: t('label.filing.staffFilingOptions.restoreCompany'),
      click: () => { restoreCompany() }
    },
    { // <!-- Put Back On -->
      showButton:
        isActionVisible(AllowableActionE.PUT_BACK_ON) &&
        isAuthorized(AuthorizedActionsE.STAFF_FILINGS),
      disabled: !business.isAllowed(AllowableActionE.PUT_BACK_ON),
      datacy: 'put-back-on',
      label: t('label.filing.staffFilingOptions.putBackOn'),
      click: () => { openPutBackOnModal.value = true }
    },
    { // <!-- Admin Freeze/Unfreeze -->
      showButton:
        isActionVisible(AllowableActionE.FREEZE_UNFREEZE) &&
        isAuthorized(AuthorizedActionsE.STAFF_FILINGS),
      disabled: !business.isAllowed(AllowableActionE.FREEZE_UNFREEZE),
      datacy: 'admin-freeze',
      label: !currentBusiness?.value?.adminFreeze
        ? t('label.filing.staffFilingOptions.adminFreeze')
        : t('label.filing.staffFilingOptions.adminUnfreeze'),
      click: () => { openFreezeUnfreezeModal.value = true }
    },
    { // <!-- Consent to Amalgamate Out -->
      showButton: currentBusiness?.value?.legalType &&
        !!getStoredFlag(LDFlags.SupportedConsentAmalgamationOutEntities)?.includes(
          currentBusiness?.value?.legalType) &&
        isActionVisible(AllowableActionE.CONSENT_AMALGAMATION_OUT) &&
        isAuthorized(AuthorizedActionsE.CONSENT_AMALGAMATION_OUT_FILING),
      disabled: !business.isAllowed(AllowableActionE.CONSENT_AMALGAMATION_OUT),
      datacy: 'consent-to-amalgamate-out',
      label: t('label.filing.staffFilingOptions.consentToAmalgamateOut'),
      click: () => {
        goToFilingsUI(`/${currentBusiness.value.identifier}/consent-amalgamation-out`, { filingId: '0' })
      }
    },
    { // <!-- Amalgamate Out -->
      showButton: currentBusiness?.value?.legalType &&
        !!getStoredFlag(LDFlags.SupportedAmalgamationOutEntities)?.includes(
          currentBusiness?.value?.legalType) &&
        isActionVisible(AllowableActionE.AMALGAMATION_OUT) &&
        isAuthorized(AuthorizedActionsE.STAFF_FILINGS),
      disabled: !business.isAllowed(AllowableActionE.AMALGAMATION_OUT),
      datacy: 'amalgamate-out',
      label: t('label.filing.staffFilingOptions.amalgamateOut'),
      click: () => {
        goToFilingsUI(`/${currentBusiness.value.identifier}/amalgamation-out`, { filingId: '0' })
      }
    },
    { // <!-- Consent to Continue Out -->
      showButton: currentBusiness?.value?.legalType &&
        !!getStoredFlag(LDFlags.SupportedConsentContinuationOutEntities)?.includes(
          currentBusiness?.value?.legalType) &&
        isActionVisible(AllowableActionE.CONSENT_CONTINUATION_OUT) &&
        isAuthorized(AuthorizedActionsE.CONSENT_CONTINUATION_OUT_FILING),
      disabled: !business.isAllowed(AllowableActionE.CONSENT_CONTINUATION_OUT),
      datacy: 'consent-to-continue-out',
      label: t('label.filing.staffFilingOptions.consentToContinueOut'),
      click: () => {
        goToFilingsUI(`/${currentBusiness.value.identifier}/consent-continuation-out`, { filingId: '0' })
      }
    },
    { // <!-- Continue Out -->
      showButton: currentBusiness?.value?.legalType &&
        !!getStoredFlag(LDFlags.SupportedContinuationOutEntities)?.includes(
          currentBusiness?.value?.legalType) &&
        isActionVisible(AllowableActionE.CONTINUATION_OUT) &&
        isAuthorized(AuthorizedActionsE.STAFF_FILINGS),
      disabled: !business.isAllowed(AllowableActionE.CONTINUATION_OUT),
      datacy: 'continue-out',
      label: t('label.filing.staffFilingOptions.continueOut'),
      click: () => {
        goToFilingsUI(`/${currentBusiness.value.identifier}/continuation-out`, { filingId: '0' })
      }
    },
    { // <!-- Extend Limited Restoration  -->
      showButton:
        isActionVisible(AllowableActionE.LIMITED_RESTORATION_EXTENSION) &&
        isAuthorized(AuthorizedActionsE.RESTORATION_REINSTATEMENT_FILING),
      disabled: !business.isAllowed(AllowableActionE.LIMITED_RESTORATION_EXTENSION),
      datacy: 'extend-limited-restore',
      label: t('label.filing.staffFilingOptions.extendLimitedRestoration'),
      click: () => { restoreCompany(FilingSubTypeE.LIMITED_RESTORATION_EXTENSION) }
    },
    { // <!-- Convert to Full Restoration  -->
      showButton:
        isActionVisible(AllowableActionE.LIMITED_RESTORATION_TO_FULL) &&
        isAuthorized(AuthorizedActionsE.RESTORATION_REINSTATEMENT_FILING),
      disabled: !business.isAllowed(AllowableActionE.LIMITED_RESTORATION_TO_FULL),
      datacy: 'convert-full-restore',
      label: t('label.filing.staffFilingOptions.fullRestoration'),
      click: () => { restoreCompany(FilingSubTypeE.LIMITED_RESTORATION_TO_FULL) }
    },
    { // <!-- Manage Receivers -->
      showButton: isActionVisible(AllowableActionE.MANAGE_RECEIVER),
      disabled: !business.isAllowed(AllowableActionE.MANAGE_RECEIVER),
      datacy: 'manage-receiver',
      label: t('label.filing.staffFilingOptions.manageReceiver'),
      click: () => { goToPersonRolesUI(`/manage-receiver/${currentBusiness.value.identifier}`) }
    },
    { // <!-- Manage Liquidators -->
      showButton: isActionVisible(AllowableActionE.MANAGE_LIQUIDATOR),
      disabled: !business.isAllowed(AllowableActionE.MANAGE_LIQUIDATOR),
      datacy: 'manage-liquidator',
      label: t('label.filing.staffFilingOptions.manageLiquidator'),
      click: () => { goToPersonRolesUI(`/manage-liquidator/${currentBusiness.value.identifier}`) }
    },
    { // <!-- Intent to Liquidate -->
      showButton: isActionVisible(AllowableActionE.INTENT_TO_LIQUIDATE),
      disabled: !business.isAllowed(AllowableActionE.INTENT_TO_LIQUIDATE),
      datacy: 'intent-to-liquidate',
      label: t('label.filing.staffFilingOptions.intentToLiquidate'),
      click: () => {
        goToPersonRolesUI(`/manage-liquidator/${currentBusiness.value.identifier}` +
          `?filingSubType=${FilingSubTypeE.INTENT_TO_LIQUIDATE}`)
      }
    },
    { // <!-- Liquidation Report -->
      showButton: isActionVisible(AllowableActionE.LIQUIDATION_REPORT),
      disabled: !business.isAllowed(AllowableActionE.LIQUIDATION_REPORT),
      datacy: 'liquidation-report',
      label: t('label.filing.staffFilingOptions.liquidationReport'),
      click: () => {
        goToPersonRolesUI(`/manage-liquidator/${currentBusiness.value.identifier}` +
          `?filingSubType=${FilingSubTypeE.LIQUIDATION_REPORT}`)
      }
    }
  ]
})

const actions: ComputedRef<Array<Array<MenuActionItem>>> = computed(() => {
  const baseActions = allActions.value.filter(action => action.showButton)

  // Remove the 'staff filing' button altogether if it's only showing options we already have under 'more actions'
  // don't show the staff menu if only these actions are permitted.
  // CONSENT_AMALGAMATION_OUT, CONSENT_CONTINUATION_OUT
  const filteredActions =
    baseActions.length <= 2
      ? baseActions.filter(
        ({ label }) =>
          label !== t('label.filing.staffFilingOptions.consentToAmalgamateOut') &&
          label !== t('label.filing.staffFilingOptions.consentToContinueOut')
      )
      : baseActions

  return [filteredActions]
})
</script>

<template>
  <div v-if="!business.isDisableNonBenCorps()">
    <LazyBcrosFilingAddStaffFilingModalFreezeUnfreeze
      v-if="openFreezeUnfreezeModal"
      @close="openFreezeUnfreezeModal = false"
      @saved="saveEmitForPolling"
    />
    <LazyBcrosFilingAddStaffFilingModalForm
      v-if="openRegistrarNotationModal"
      :filing-type="FilingTypes.REGISTRARS_NOTATION"
      @close="openRegistrarNotationModal = false"
      @saved="saveEmitForPolling"
    />
    <LazyBcrosFilingAddStaffFilingModalForm
      v-if="openRegistrarOrderModal"
      :filing-type="FilingTypes.REGISTRARS_ORDER"
      @close="openRegistrarOrderModal = false"
      @saved="saveEmitForPolling"
    />
    <LazyBcrosFilingAddStaffFilingModalForm
      v-if="openCourtOrderModal"
      :filing-type="FilingTypes.COURT_ORDER"
      @close="openCourtOrderModal = false"
      @saved="saveEmitForPolling"
    />
    <LazyBcrosFilingAddStaffFilingModalForm
      v-if="openDissolutionModal"
      :filing-type="FilingTypes.DISSOLUTION"
      @close="openDissolutionModal = false"
      @saved="saveEmitForPolling"
    />
    <LazyBcrosFilingAddStaffFilingModalForm
      v-if="openPutBackOnModal"
      :filing-type="FilingTypes.PUT_BACK_ON"
      @close="openPutBackOnModal = false"
      @saved="saveEmitForPolling"
    />

    <UDropdown v-if="actions[0].length > 0 && currentBusiness" :items="actions" :popper="{ placement: 'bottom-start' }">
      <template #default>
        <UButton
          variant="ghost"
          data-cy="add-staff-filing"
          label="Add Staff Filing"
          icon="i-mdi-plus"
        />
      </template>

      <template #item="{ item }">
        <UButton
          variant="ghost"
          :label="item.label"
          :disabled="item.disabled"
          :data-cy="item.datacy"
          class="w-full text-nowrap"
          @click.stop="item.click"
        />
      </template>
    </UDropdown>
  </div>
</template>
