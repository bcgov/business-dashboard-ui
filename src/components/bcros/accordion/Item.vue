<template>
  <div :data-cy="'accordion-item_' + name" :class="`flex flex-col ${disabled ? '' : 'pl-3 pb-3'}`">
    <div v-if="item.showEmail" class="flex flex-col w-3/4 ml-10 pb-3">
      <div class="text-gray-900 pb-1">
        {{ $t('label.general.email') }}
      </div>
      <span v-if="item.email" class="break-all">
        {{ item.email }}
      </span>
      <span v-else>
        {{ $t('text.general.notEntered') }}
      </span>
    </div>
    <BcrosAddress
      v-if="item.address"
      :name="name"
      :address="item.address"
      :show-address-icons="item.showAddressIcons"
    />
  </div>
</template>

<script setup lang="ts">
defineProps({
  name: { type: String, required: true },
  item: { type: Object as PropType<BcrosAccordionItem>, required: true },
  disabled: { type: Boolean, default: false, required: false }
})
</script>
