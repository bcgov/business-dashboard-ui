<template>
  <BcrosAddressAccordion
    :name="name"
    :items="addressItems"
  />
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
const route = useRoute()
const business = useBcrosBusiness()
const { currentBusinessAddresses } = storeToRefs(business)

defineProps({
  name: { type: String, required: true }
})

const addressItems = computed(() => {
  const items = [{
    label: 'Registered Office',
    icon: '',
    defaultOpen: true,
    address: currentBusinessAddresses.value.registeredOffice,
    showAddressIcons: true
  }]

  if (currentBusinessAddresses.value.recordsOffice) {
    items.push({
      label: 'Records Office',
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
