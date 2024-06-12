<template>
  <div :data-cy="'accordion_' + name">
    <UAccordion
      :items="items"
    >
      <template #registeredOffice="{ item }">
        <BcrosAddressDetail
          :delivery-address="item.deliveryAddress"
          :mailing-address="item.mailingAddress"
        />
      </template>

      <template #recordsOffice="{ item }">
        <BcrosAddressDetail
          :delivery-address="item.deliveryAddress"
          :mailing-address="item.mailingAddress"
        />
      </template>
    </UAccordion>
  </div>
</template>

<script setup lang="ts">
defineProps({
  name: { type: String, required: true }
})
const items = [
  {
    label: 'Registered Office',
    icon: '',
    defaultOpen: true, // To confirm: do we need to leave one section open by default?
    slot: 'registeredOffice',
    deliveryAddress: '123 ABC Street, Vancouver, BC'
  },
  {
    label: 'Records Office',
    icon: '',
    defaultOpen: true,
    slot: 'recordsOffice',
    deliveryAddress: '222 2nd Avenue, Vancouver, BC',
    mailingAddress: '100 XYZ Street, Vancouver, BC'
  }
]
</script>
