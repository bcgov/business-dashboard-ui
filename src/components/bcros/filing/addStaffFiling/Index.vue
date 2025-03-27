<script lang="ts" setup>
import type { DropdownItem } from '#ui/types'
import { FilingTypes } from '@bcrs-shared-components/enums'

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
const { goToCreateUI, goToEditUI, goToFilingsUI } = useBcrosNavigate()

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
      showButton: isActionVisible(AllowableActionE.REGISTRARS_NOTATION),
      disabled: !business.isAllowed(AllowableActionE.REGISTRARS_NOTATION),
      datacy: 'registrar-notation',
      label: t('label.filing.staffFilingOptions.registrarsNotation'),
      click: () => { openRegistrarNotationModal.value = true }
    },
    { // <!-- Registrar Order -->
      showButton: isActionVisible(AllowableActionE.REGISTRARS_ORDER),
      disabled: !business.isAllowed(AllowableActionE.REGISTRARS_ORDER),
      datacy: 'registrar-order',
      label: t('label.filing.staffFilingOptions.registrarsOrder'),
      click: () => { openRegistrarOrderModal.value = true }
    },
    { // <!-- Court Order -->
      showButton: isActionVisible(AllowableActionE.COURT_ORDER),
      disabled: !business.isAllowed(AllowableActionE.COURT_ORDER),
      datacy: 'court-order',
      label: t('label.filing.staffFilingOptions.courtOrder'),
      click: () => {
        goToFilingsUI(`/${currentBusiness.value.identifier}/court-order`, { filingId: '0' })
      }
    },
    { // <!-- Record Conversion -->
      showButton: isActionVisible(AllowableActionE.RECORD_CONVERSION),
      disabled: !business.isAllowed(AllowableActionE.RECORD_CONVERSION),
      datacy: 'record-conversion',
      label: t('label.filing.staffFilingOptions.recordConversion'),
      click: () => {
        goToEditUI(`/${currentBusiness.value.identifier}/conversion`)
      }
    },
    { // <!-- Admin Dissolution -->
      showButton: isActionVisible(AllowableActionE.ADMINISTRATIVE_DISSOLUTION),
      disabled: !business.isAllowed(AllowableActionE.ADMINISTRATIVE_DISSOLUTION),
      datacy: 'dissolution',
      label: t('label.filing.staffFilingOptions.dissolution'),
      click: () => { openDissolutionModal.value = true }
    },
    { // <!-- Restore Company  -->
      showButton: isActionVisible(AllowableActionE.RESTORATION),
      disabled: !business.isAllowed(AllowableActionE.RESTORATION),
      datacy: 'restore',
      label: t('label.filing.staffFilingOptions.restoreCompany'),
      click: () => { restoreCompany() }
    },
    { // <!-- Put Back On -->
      showButton: isActionVisible(AllowableActionE.PUT_BACK_ON),
      disabled: !business.isAllowed(AllowableActionE.PUT_BACK_ON),
      datacy: 'put-back-on',
      label: t('label.filing.staffFilingOptions.putBackOn'),
      click: () => { openPutBackOnModal.value = true }
    },
    { // <!-- Admin Freeze/Unfreeze -->
      showButton: isActionVisible(AllowableActionE.FREEZE_UNFREEZE),
      disabled: !business.isAllowed(AllowableActionE.FREEZE_UNFREEZE),
      datacy: 'admin-freeze',
      label: !currentBusiness?.value?.adminFreeze
        ? t('label.filing.staffFilingOptions.adminFreeze')
        : t('label.filing.staffFilingOptions.adminUnfreeze'),
      click: () => { openFreezeUnfreezeModal.value = true }
    },
    { // <!-- Consent to Amalgamate Out -->
      showButton: currentBusiness?.value?.legalType &&
        !!getStoredFlag('supported-consent-amalgamation-out-entities')?.includes(
          currentBusiness?.value?.legalType) &&
        isActionVisible(AllowableActionE.CONSENT_AMALGAMATION_OUT),
      disabled: !business.isAllowed(AllowableActionE.CONSENT_AMALGAMATION_OUT),
      datacy: 'consent-to-amalgamate-out',
      label: t('label.filing.staffFilingOptions.consentToAmalgamateOut'),
      click: () => {
        goToFilingsUI(`/${currentBusiness.value.identifier}/consent-amalgamation-out`, { filingId: '0' })
      }
    },
    { // <!-- Amalgamate Out -->
      showButton: currentBusiness?.value?.legalType &&
        !!getStoredFlag('supported-amalgamation-out-entities')?.includes(
          currentBusiness?.value?.legalType) &&
        isActionVisible(AllowableActionE.AMALGAMATION_OUT),
      disabled: !business.isAllowed(AllowableActionE.AMALGAMATION_OUT),
      datacy: 'amalgamate-out',
      label: t('label.filing.staffFilingOptions.amalgamateOut'),
      click: () => {
        goToFilingsUI(`/${currentBusiness.value.identifier}/amalgamation-out`, { filingId: '0' })
      }
    },
    { // <!-- Consent to Continue Out -->
      showButton: currentBusiness?.value?.legalType &&
        !!getStoredFlag('supported-consent-continuation-out-entities')?.includes(
          currentBusiness?.value?.legalType) &&
        isActionVisible(AllowableActionE.CONSENT_CONTINUATION_OUT),
      disabled: !business.isAllowed(AllowableActionE.CONSENT_CONTINUATION_OUT),
      datacy: 'consent-to-continue-out',
      label: t('label.filing.staffFilingOptions.consentToContinueOut'),
      click: () => {
        goToFilingsUI(`/${currentBusiness.value.identifier}/consent-continuation-out`, { filingId: '0' })
      }
    },
    { // <!-- Continue Out -->
      showButton: isActionVisible(AllowableActionE.CONTINUATION_OUT),
      disabled: !business.isAllowed(AllowableActionE.CONTINUATION_OUT),
      datacy: 'continue-out',
      label: t('label.filing.staffFilingOptions.continueOut'),
      click: () => {
        goToFilingsUI(`/${currentBusiness.value.identifier}/continuation-out`, { filingId: '0' })
      }
    },
    { // <!-- Extend Limited Restoration  -->
      showButton: isActionVisible(AllowableActionE.LIMITED_RESTORATION_EXTENSION),
      disabled: !business.isAllowed(AllowableActionE.LIMITED_RESTORATION_EXTENSION),
      datacy: 'extend-limited-restore',
      label: t('label.filing.staffFilingOptions.extendLimitedRestoration'),
      click: () => { restoreCompany(FilingSubTypeE.LIMITED_RESTORATION_EXTENSION) }
    },
    { // <!-- Convert to Full Restoration  -->
      showButton: isActionVisible(AllowableActionE.LIMITED_RESTORATION_TO_FULL),
      disabled: !business.isAllowed(AllowableActionE.LIMITED_RESTORATION_TO_FULL),
      datacy: 'convert-full-restore',
      label: t('label.filing.staffFilingOptions.fullRestoration'),
      click: () => { restoreCompany(FilingSubTypeE.LIMITED_RESTORATION_TO_FULL) }
    }
  ]
})

const actions: ComputedRef<Array<Array<MenuActionItem>>> = computed(() => {
  const allowedActions = allActions.value.filter(action => action.showButton)
  return [allowedActions]
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
