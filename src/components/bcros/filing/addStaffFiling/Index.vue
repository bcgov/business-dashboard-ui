<script lang="ts" setup>
import { FilingTypes } from '@bcrs-shared-components/enums'
const t = useNuxtApp().$i18n.t

interface MenuActionItem extends DropdownItem {
  showButton: boolean,
  datacy: string
}

const business = useBcrosBusiness()
const { currentBusiness } = storeToRefs(business)
const { goToBusinessDashboard } = useBcrosNavigate()

const openFreezeUnfreezeModal = ref(false)
const openRegistrarNotationModal = ref(false)
const openRegistrarOrderModal = ref(false)
const openCourtOrderModal = ref(false)
const openDissolutionModal = ref(false)
const openPutBackOnModal = ref(false)

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
    { // <!-- Admin Dissolution -->
      showButton: business.isAllowedToFile(FilingTypes.DISSOLUTION),
      disabled: false,
      datacy: 'dissolution',
      label: t('label.filing.staffFilingOptions.dissolution'),
      click: () => { openDissolutionModal.value = true }
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
    { // <!-- Put Back On -->
      showButton: business.isAllowedToFile(FilingTypes.PUT_BACK_ON),
      disabled: false,
      datacy: 'put-back-on',
      label: t('label.filing.staffFilingOptions.putBackOn'),
      click: () => { openPutBackOnModal.value = true }
    },
    { // <!-- Consent to Amalgamate Out -->
      showButton: business.isAllowedToFile(FilingTypes.CONSENT_AMALGAMATION_OUT),
      disabled: false,
      datacy: 'consent-to-amalgamate-out',
      label: t('button.tombstone.menuAction.consentToAmalgamateOut'),
      click: () => {
        goToBusinessDashboard(`/${currentBusiness.value.identifier}/consent-amalgamation-out'`, { filingId: '0' })
      }
    },
    { // <!-- Consent to Continue Out -->
      showButton: business.isAllowedToFile(FilingTypes.CONSENT_CONTINUATION_OUT),
      disabled: false,
      datacy: 'consent-to-continue-out',
      label: t('button.tombstone.menuAction.consentToContinueOut'),
      click: () => {
        goToBusinessDashboard(`/${currentBusiness.value.identifier}/consent-continuation-out`, { filingId: '0' })
      }
    }
    // amalgamate
    // continue out
    // restore
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
          :data-cy="item.datacy"
          class="w-full text-nowrap"
          @click="item.click"
        />
      </template>
    </UDropdown>
  </div>
</template>
