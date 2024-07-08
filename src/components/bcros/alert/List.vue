<template>
  <div data-cy="alerts-display">
    <UAccordion
      color="black"
      variant="outline"
      size="sm"
      :items="alerts"
    >
      <template #default="{ item, index, open }">
        <BcrosAlert
          :class="open ? 'pt-2' : ''"
          :alert="item"
          :index="index"
          :show-description="false"
          :contact="contact"
        />
      </template>
      <template #item="{ item, index, open }">
        <BcrosAlert :class="open ? 'pb-2' : ''" :alert="item" :index="index" :show-header="false" :contact="contact" />
      </template>
    </UAccordion>
  </div>
</template>

<script setup lang="ts">
defineProps<{ alerts: Array<Partial<AlertI>>, contact: boolean }>()
</script>
