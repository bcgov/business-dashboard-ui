<template>
  <BcrosAddressAccordion
    :name="name"
    :items="directors"
  />
</template>

<script setup lang="ts">
defineProps({
  name: { type: String, required: true }
})

// TO-DO: this are just some placeholder data. Update it in ticket #21300
const directors = computed(() => {
  return [
    {
      label: 'SOME TEST NAME',
      defaultOpen: false,
      address: {
        deliveryAddress: {},
        mailingAddress: {}
      },
      showAddressIcons: false,
      showAvatar: true
    },
    {
      label: 'ANOTHER NAME',
      defaultOpen: false,
      address: {
        deliveryAddress: {},
        mailingAddress: {}
      },
      showAddressIcons: false,
      showAvatar: true
    }
  ]
})
</script>
