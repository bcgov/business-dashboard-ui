<template>
  <BcrosAddressAccordion
    :name="name"
    :items="addressItems"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
const t = useNuxtApp().$i18n.t
const route = useRoute()
const business = useBcrosBusiness()
const { currentBusinessAddresses } = storeToRefs(business)

defineProps({
  name: { type: String, required: true }
})

const addressItems = computed(() => {
  const items = [{
    label: t('label.address.officeType.registered'),
    icon: '',
    defaultOpen: true, // To confirm: will the registered office address panel be expanded by default?
    address: currentBusinessAddresses.value.registeredOffice,
    showAddressIcons: true
  }]

  if (currentBusinessAddresses.value.recordsOffice) {
    items.push({
      label: t('label.address.officeType.records'),
      icon: '',
      defaultOpen: false,
      address: currentBusinessAddresses.value.recordsOffice,
      showAddressIcons: true
    })
  }

  return items
})

onBeforeMount(() => {
  if (route.params.identifier) {
    business.loadBusinessAddresses(route.params.identifier as string)
  }
})
</script>
