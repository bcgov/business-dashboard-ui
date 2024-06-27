<template>
  <div
    v-if="showBusinessOffice"
    class="p-3 pr-0 text-sm"
  >
    <BcrosAddress
      name="businessAddresses"
      class="text-gray-700"
      :address="currentBusinessAddresses.businessOffice"
      :show-address-icons="true"
    />
  </div>
  <BcrosAccordion
    v-else
    :name="name"
    :items="addressItems"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

const t = useNuxtApp().$i18n.t
const business = useBcrosBusiness()
const { currentBusinessAddresses } = storeToRefs(business)

const props = defineProps({
  name: { type: String, required: true },
  expandTopItem: { type: Boolean, default: false }
})

const showBusinessOffice = computed(() => {
  return !!currentBusinessAddresses.value.businessOffice
})

const addressItems = computed(() => {
  const items: BcrosAccordionItem[] = []

  if (currentBusinessAddresses.value.registeredOffice) {
    items.push({
      label: t('label.address.officeType.registered'),
      defaultOpen: props.expandTopItem,
      showAddressIcons: true,
      showAvatar: false,
      showEmail: false,
      address: currentBusinessAddresses.value.registeredOffice
    })
  }

  if (currentBusinessAddresses.value.recordsOffice) {
    items.push({
      label: t('label.address.officeType.records'),
      defaultOpen: props.expandTopItem && !currentBusinessAddresses.value.registeredOffice,
      showAddressIcons: true,
      showAvatar: false,
      showEmail: false,
      address: currentBusinessAddresses.value.recordsOffice
    })
  }

  return items
})
</script>
