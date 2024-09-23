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
const isModalOpen = ref(false)
const modalTitle = ref('')
const modalBody = ref('')
const modalSubmit = ref(() => {})
const modalSubmitLoading = ref(false)
const filingError = ref(false)

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
      click: () => {
        const modalContents =
          (currentBusiness?.value?.adminFreeze ? t('filing.freeze.messageUn') : t('filing.freeze.message')) +
          ' ' + currentBusiness.value.legalName +
          ', ' + currentBusiness.value.identifier +
          '.<br /> ' + t('filing.freeze.message2')
        isModalOpen.value = true
        modalTitle.value = !currentBusiness?.value?.adminFreeze
          ? t('filing.name.adminFreeze')
          : t('filing.name.adminUnfreeze')
        modalBody.value = modalContents
        modalSubmitLoading.value = false
        modalSubmit.value = async() => {
          modalSubmitLoading.value = true
          const response = await filings.createFreezeFiling(currentBusiness.value)
          modalSubmitLoading.value = false
          if (response.error?.value) {
            console.error(response.error.value)
            filingError.value = true
            return
          }
          filingError.value = false
          business.loadBusiness(currentBusiness.value.identifier, true)
          filings.loadFilings(currentBusiness.value.identifier, true)
          isModalOpen.value = false
        }
      }
    }]
})

const actions: ComputedRef<Array<Array<MenuActionItem>>> = computed(() => {
  const allowedActions = allActions.value.filter(action => action.showButton)
  return [allowedActions]
})
</script>

<template>
  <div>
    <UModal v-model="isModalOpen">
      <UCard :ui="{header: {background: 'bg-bcGovColor-darkBlue', base: 'font-2xl font-bold text-white'}}">
        <template #header>
          <span id="dialog-title">{{ modalTitle }}</span>
        </template>
        <p data-cy="modal-body" v-html="modalBody" />
        <template #footer>
          <div class="float-right space-x-3">
            <UButton
              variant="ghost"
              :disabled="modalSubmitLoading"
              class="font-bold"
              :class="{
                'text-red-500': filingError
              }"
              data-cy="submit-add-staff-filing-modal"
              @click="modalSubmit"
            >
              {{ $t('button.dialog.file') }}
            </UButton>
            <UButton
              variant="ghost"
              :disabled="modalSubmitLoading"
              data-cy="cancel-add-staff-filing-modal"
              @click="isModalOpen = false"
            >
              {{ $t('button.dialog.cancel') }}
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
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
