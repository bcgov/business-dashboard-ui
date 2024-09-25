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

const openFreezeUnfreezeModal = ref(false)
const openRegistrarNotationModal = ref(false)

const allowedActions = computed(() => {
  return currentBusiness.value?.allowedActions
})

watch(allowedActions, () => {
  canFileFreeze.value = business.isAllowedToFile(FilingTypes.ADMIN_FREEZE)
}, { deep: true, immediate: true })

const allActions: ComputedRef<Array<MenuActionItem>> = computed(() => {
  return [
    {
      showButton: canFileFreeze.value,
      disabled: false,
      datacy: 'admin-freeze',
      label: !currentBusiness?.value?.adminFreeze ? t('filing.name.adminFreeze') : t('filing.name.adminUnfreeze'),
      click: () => { openFreezeUnfreezeModal.value = true }
    },
    {
      showButton: true, // TO-DO
      disabled: false,
      datacy: 'registrar-notation',
      label: 'Registrar Notation',
      click: () => { openRegistrarNotationModal.value = true }
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
    <BcrosFilingAddStaffFilingFreezeUnfreeze
      v-if="openFreezeUnfreezeModal"
      @close="openFreezeUnfreezeModal = false"
    />
    <BcrosFilingAddStaffFilingRegistrarNotation
      v-if="openRegistrarNotationModal"
      @close="openRegistrarNotationModal = false"
    />
    <BcrosFilingAddStaffFilingRegistrarNotation
      v-if="openRegistrarNotationModal"
      @close="openRegistrarNotationModal = false"
    />
    <BcrosFilingAddStaffFilingRegistrarNotation
      v-if="openRegistrarNotationModal"
      @close="openRegistrarNotationModal = false"
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
