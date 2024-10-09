<script lang="ts" setup>
import { FilingTypes } from '@bcrs-shared-components/enums'

const t = useNuxtApp().$i18n.t

interface MenuActionItem extends DropdownItem {
  showButton: boolean,
  datacy: string
}

const filings = useBcrosFilings()
const business = useBcrosBusiness()
const { currentBusiness } = storeToRefs(business)
const { goToBusinessDashboard, goToEditPage, goToCreatePage } = useBcrosNavigate()

const openFreezeUnfreezeModal = ref(false)
const openRegistrarNotationModal = ref(false)
const openRegistrarOrderModal = ref(false)
const openCourtOrderModal = ref(false)
const openDissolutionModal = ref(false)
const openPutBackOnModal = ref(false)

// Create a restoration filing and navigate to the appropriate page
const restoreCompany = async (restorationType: FilingSubTypeE = null) => {
  // create restoration filing
  const response: any = await filings.createFiling(
    currentBusiness.value,
    FilingTypes.RESTORATION,
    { type: restorationType }
  )

  if (response.error?.value) {
    console.error(response.error.value)
    return
  }

  const filingId = response.data?.value.filing.header.filingId + 1

  // navigate to Edit UI for limited restoration extension filing
  // navigate to Edit UI for limited restoration to full filing
  // navigate to Create UI for full or limited restoration filing
  if (restorationType === FilingSubTypeE.LIMITED_RESTORATION_EXTENSION) {
    goToEditPage(`/${currentBusiness.value.identifier}/limitedRestorationExtension`, { 'restoration-id': filingId })
  } else if (restorationType === FilingStatusE.LIMITED_RESTORATION_TO_FULL) {
    goToEditPage(`/${currentBusiness.value.identifier}/limitedRestorationToFull`, { 'restoration-id': filingId })
  } else {
    goToCreatePage('/restoration-business-name', { id: currentBusiness.value.identifier })
  }
}

const allActions: ComputedRef<Array<MenuActionItem>> = computed(() => {
  return [
    { // <!-- Registrar Notation -->
      showButton: business.isAllowedToFile(FilingTypes.REGISTRARS_NOTATION),
      disabled: false,
      datacy: 'registrar-notation',
      label: t('label.filing.staffFilingOptions.registrarsNotation'),
      click: () => { openRegistrarNotationModal.value = true }
    },
    { // <!-- Registrar Order -->
      showButton: business.isAllowedToFile(FilingTypes.REGISTRARS_ORDER),
      disabled: false,
      datacy: 'registrar-order',
      label: t('label.filing.staffFilingOptions.registrarsOrder'),
      click: () => { openRegistrarOrderModal.value = true }
    },
    { // <!-- Court Order -->
      showButton: business.isAllowedToFile(FilingTypes.COURT_ORDER),
      disabled: false,
      datacy: 'court-order',
      label: t('label.filing.staffFilingOptions.courtOrder'),
      click: () => { openCourtOrderModal.value = true }
    },
    { // <!-- Record Conversion -->
      showButton: business.isEntityFirm,
      disabled: !business.isAllowedToFile(FilingTypes.CONSENT_CONTINUATION_OUT),
      datacy: 'record-conversion',
      label: t('label.filing.staffFilingOptions.recordConversion'),
      click: () => {
        goToEditPage(`/${currentBusiness.value.identifier}/conversion`)
      }
    },
    { // <!-- Admin Dissolution -->
      showButton: currentBusiness.value?.state !== BusinessStateE.HISTORICAL,
      disabled: !business.isAllowedToFile(FilingTypes.DISSOLUTION),
      datacy: 'dissolution',
      label: t('label.filing.staffFilingOptions.dissolution'),
      click: () => { openDissolutionModal.value = true }
    },
    { // <!-- Restore Company  -->
      showButton: currentBusiness.value?.state !== BusinessStateE.HISTORICAL,
      disabled: !business.isAllowedToFile(FilingTypes.RESTORATION),
      datacy: 'restore',
      label: t('label.filing.staffFilingOptions.restoreCompany'),
      click: () => { restoreCompany() }
    },
    { // <!-- Put Back On -->
      showButton: business.isAllowedToFile(FilingTypes.PUT_BACK_ON),
      disabled: false,
      datacy: 'put-back-on',
      label: t('label.filing.staffFilingOptions.putBackOn'),
      click: () => { openPutBackOnModal.value = true }
    },
    { // <!-- Admin Freeze/Unfreeze -->
      showButton: business.isAllowedToFile(FilingTypes.ADMIN_FREEZE),
      disabled: false,
      datacy: 'admin-freeze',
      label: !currentBusiness?.value?.adminFreeze
        ? t('label.filing.staffFilingOptions.adminFreeze')
        : t('label.filing.staffFilingOptions.adminUnfreeze'),
      click: () => { openFreezeUnfreezeModal.value = true }
    },
    { // <!-- Consent to Amalgamate Out -->
      showButton: currentBusiness.value?.state !== BusinessStateE.HISTORICAL,
      disabled: !business.isAllowedToFile(FilingTypes.CONSENT_AMALGAMATION_OUT),
      datacy: 'consent-to-amalgamate-out',
      label: t('label.filing.staffFilingOptions.consentToAmalgamateOut'),
      click: () => {
        goToBusinessDashboard(`/${currentBusiness.value.identifier}/consent-amalgamation-out'`, { filingId: '0' })
      }
    },
    { // <!-- Amalgamate -->
      showButton: currentBusiness.value?.state !== BusinessStateE.HISTORICAL,
      disabled: !business.isAllowedToFile(FilingTypes.AMALGAMATION_OUT),
      datacy: 'amalgamate-out',
      label: t('label.filing.staffFilingOptions.amalgamateOut'),
      click: () => {
        goToBusinessDashboard(`/${currentBusiness.value.identifier}/amalgamation-out'`, { filingId: '0' })
      }
    },
    { // <!-- Consent to Continue Out -->
      showButton: currentBusiness.value?.state !== BusinessStateE.HISTORICAL,
      disabled: !business.isAllowedToFile(FilingTypes.CONSENT_CONTINUATION_OUT),
      datacy: 'consent-to-continue-out',
      label: t('label.filing.staffFilingOptions.consentToContinueOut'),
      click: () => {
        goToBusinessDashboard(`/${currentBusiness.value.identifier}/consent-continuation-out`, { filingId: '0' })
      }
    },
    { // <!-- Continue Out -->
      showButton: currentBusiness.value?.state !== BusinessStateE.HISTORICAL,
      disabled: !business.isAllowedToFile(FilingTypes.CONTINUATION_OUT),
      datacy: 'continue-out',
      label: t('label.filing.staffFilingOptions.continueOut'),
      click: () => {
        goToBusinessDashboard(`/${currentBusiness.value.identifier}/consent-continuation-out`, { filingId: '0' })
      }
    },
    { // <!-- Extend Limited Restoration  -->
      showButton: currentBusiness.value?.state !== BusinessStateE.HISTORICAL,
      disabled: !business.isAllowedToFile(FilingTypes.RESTORATION, FilingSubTypeE.LIMITED_RESTORATION_EXTENSION),
      datacy: 'limit-restore',
      label: t('label.filing.staffFilingOptions.extendLimitedRestoration'),
      click: () => { restoreCompany(FilingSubTypeE.LIMITED_RESTORATION_EXTENSION) }
    },
    { // <!-- Convert to Full Restoration  -->
      showButton: business.isAllowedToFile(FilingTypes.RESTORATION, FilingSubTypeE.LIMITED_RESTORATION_TO_FULL),
      disabled: false,
      datacy: 'full-restore',
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
  <div>
    <LazyBcrosFilingAddStaffFilingModalFreezeUnfreeze
      v-if="openFreezeUnfreezeModal"
      @close="openFreezeUnfreezeModal = false"
    />

    <LazyBcrosFilingAddStaffFilingModalForm
      v-if="openRegistrarNotationModal"
      :filing-type="FilingTypes.REGISTRARS_NOTATION"
      @close="openRegistrarNotationModal = false"
    />
    <LazyBcrosFilingAddStaffFilingModalForm
      v-if="openRegistrarOrderModal"
      :filing-type="FilingTypes.REGISTRARS_ORDER"
      @close="openRegistrarOrderModal = false"
    />
    <LazyBcrosFilingAddStaffFilingModalForm
      v-if="openCourtOrderModal"
      :filing-type="FilingTypes.COURT_ORDER"
      @close="openCourtOrderModal = false"
    />
    <LazyBcrosFilingAddStaffFilingModalForm
      v-if="openDissolutionModal"
      :filing-type="FilingTypes.DISSOLUTION"
      @close="openDissolutionModal = false"
    />
    <LazyBcrosFilingAddStaffFilingModalForm
      v-if="openPutBackOnModal"
      :filing-type="FilingTypes.PUT_BACK_ON"
      @close="openPutBackOnModal = false"
    />

    <UDropdown v-if="actions[0].length > 0" :items="actions" :popper="{ placement: 'bottom-start' }">
      <template #default>
        <UButton variant="ghost" data-cy="add-staff-filing" label="Add Staff Filing" icon="i-mdi-plus" />
      </template>

      <template #item="{ item }">
        <UButton
          variant="ghost"
          :label="item.label"
          :disabled="item.disabled"
          :data-cy="item.datacy"
          class="w-full text-nowrap"
          @click="item.click"
        />
      </template>
    </UDropdown>
  </div>
</template>
