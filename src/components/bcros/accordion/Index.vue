<template>
  <UAccordion
    :items="items"
    class="overflow-y-auto overflow-x-hidden max-h-[336px]"
    v-bind="$attrs"
  >
    <template #default="{ item, open, index }">
      <UButton
        ref="accordionButton"
        variant="ghost"
        class="hover:bg-white text-sm font-bold text-gray-900 rounded p-4 pl-3"
        :data-cy="'accordion_item_button_' + name + index"
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
    <template #item="{ item, index}">
      <BcrosAccordionItem
        :name="name + '_' + index"
        :item="item"
      />
    </template>
  </UAccordion>
</template>

<script setup lang="ts">
defineProps({
  name: { type: String, required: true },
  items: { type: Array as PropType<BcrosAccordionItem[]>, required: true }
})
</script>
