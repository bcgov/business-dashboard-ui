<template>
  <div :data-cy="'address_accordion_' + name">
    <UAccordion
      :items="items"
    >
      <template #item="{ item }">
        <div v-if="item.address" class="flex flex-col pl-3">
          <div class="flex">
            <UIcon v-if="item.showAddressIcons" name="i-mdi-truck" class="mr-5 text-2xl bg-primary" />
            <div class="flex flex-col w-3/4" :class="item.showAddressIcons ? '' : 'ml-6'">
              <div class="text-gray-900">
                {{ `Delivery Address` }}
              </div>
              <BcrosAddressDisplay :address="item.address.deliveryAddress" />
            </div>
          </div>
          <div class="flex pt-3">
            <UIcon v-if="item.showAddressIcons" name="i-mdi-email-outline" class="mr-5 text-2xl bg-primary" />
            <div class="flex flex-col w-3/4" :class="item.showAddressIcons ? '' : 'ml-6'">
              <div class="text-gray-900">
                {{ `Mailing Address` }}
              </div>
              <BcrosAddressDisplay
                v-if="differentMailingAddress(item.address)"
                :address="item.address.mailingAddress"
              />
              <div v-else>
                {{ `Same as above` }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </UAccordion>
  </div>
</template>

<script setup lang="ts">
import type { AccordionItem } from '#ui/types'

defineProps({
  name: { type: String, required: true },
  items: { type: Array as PropType<AccordionItem[]>, required: true }
})

const differentMailingAddress = (address: deliveryAndMailingAddressI) => {
  return !isSame(address.deliveryAddress, address.mailingAddress, ['id', 'addressType'])
}
</script>
