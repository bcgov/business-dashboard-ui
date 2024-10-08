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

const canFileFreeze = ref(false)
const canFileRegistrarNotation = ref(false)
const canFileRegistrarOrder = ref(false)
const canFileCourtOrder = ref(false)
const canFileDissolution = ref(false)

const openFreezeUnfreezeModal = ref(false)
const openRegistrarNotationModal = ref(false)
const openRegistrarOrderModal = ref(false)
const openCourtOrderModal = ref(false)
const openDissolutionModal = ref(false)

const allowedActions = computed(() => {
  return currentBusiness.value?.allowedActions
})

watch(allowedActions, () => {
  canFileFreeze.value = business.isAllowedToFile(FilingTypes.ADMIN_FREEZE)
  canFileRegistrarNotation.value = business.isAllowedToFile(FilingTypes.REGISTRARS_NOTATION)
  canFileRegistrarOrder.value = business.isAllowedToFile(FilingTypes.REGISTRARS_ORDER)
  canFileCourtOrder.value = business.isAllowedToFile(FilingTypes.COURT_ORDER)
  canFileDissolution.value = business.isAllowedToFile(FilingTypes.DISSOLUTION)
}, { deep: true, immediate: true })

const allActions: ComputedRef<Array<MenuActionItem>> = computed(() => {
  return [
    {
      showButton: canFileRegistrarNotation.value,
      disabled: false,
      datacy: 'registrar-notation',
      label: t('label.filing.staffFilingOptions.registrarsNotation'),
      click: () => { openRegistrarNotationModal.value = true }
    },
    {
      showButton: canFileRegistrarOrder.value,
      disabled: false,
      datacy: 'registrar-order',
      label: t('label.filing.staffFilingOptions.registrarsOrder'),
      click: () => { openRegistrarOrderModal.value = true }
    },
    {
      showButton: canFileFreeze.value,
      disabled: false,
      datacy: 'admin-freeze',
      label: !currentBusiness?.value?.adminFreeze
        ? t('label.filing.staffFilingOptions.adminFreeze')
        : t('label.filing.staffFilingOptions.adminUnfreeze'),
      click: () => { openFreezeUnfreezeModal.value = true }
    },
    {
      showButton: canFileCourtOrder.value,
      disabled: false,
      datacy: 'court-order',
      label: t('label.filing.staffFilingOptions.courtOrder'),
      click: () => { openCourtOrderModal.value = true }
    },
    {
      showButton: canFileDissolution.value,
      disabled: false,
      datacy: 'dissolution',
      label: t('label.filing.staffFilingOptions.dissolution'),
      click: () => { openDissolutionModal.value = true }
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
