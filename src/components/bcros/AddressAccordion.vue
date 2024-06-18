<template>
  <div :data-cy="'address_accordion_' + name">
    <UAccordion
      :items="items"
    >
      <template #default="{ item, open }">
        <UButton
          variant="ghost"
          class="hover:bg-white text-sm font-bold text-gray-900 rounded p-4 pl-3"
        >
          <template #leading>
            <div v-if="item.showAvatar" class="w-6 h-6 rounded-full flex items-center justify-center">
              <UAvatar size="xs" class="bg-primary" :ui="{text: 'text-white'}" :text="item.label.substring(0,1)" />
            </div>
          </template>
          <span class="text-left" :class="item.showAvatar ? 'pl-2' : ''">{{ item.label }}</span>
          <template #trailing>
            <UIcon
              name="i-heroicons-chevron-down-20-solid"
              class="w-5 h-5 ms-auto transform transition-transform duration-200 text-gray-700"
              :class="[open && '-rotate-180']"
            />
          </template>
        </UButton>
      </template>
      <template #item="{ item }">
        <div v-if="item.address" class="flex flex-col pl-3">
          <div class="flex">
            <UIcon v-if="item.showAddressIcons" name="i-mdi-truck" class="mr-5 text-2xl bg-primary" />
            <div class="flex flex-col w-3/4" :class="item.showAddressIcons ? '' : 'ml-10'">
              <div class="text-gray-900">
                {{ $t('label.address.addressType.delivery') }}
              </div>
              <BcrosAddressDisplay :address="item.address.deliveryAddress" />
            </div>
          </div>
          <div class="flex pt-3">
            <UIcon v-if="item.showAddressIcons" name="i-mdi-email-outline" class="mr-5 text-2xl bg-primary" />
            <div class="flex flex-col w-3/4" :class="item.showAddressIcons ? '' : 'ml-10'">
              <div class="text-gray-900">
                {{ $t('label.address.addressType.mailing') }}
              </div>
              <BcrosAddressDisplay
                v-if="differentMailingAddress(item.address)"
                :address="item.address.mailingAddress"
              />
              <div v-else>
                {{ $t('text.general.saveAsAbove') }}
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
