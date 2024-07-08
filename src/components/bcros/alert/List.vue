<template>
  <div data-cy="alerts-display">
    <UAccordion
      color="black"
      variant="outline"
      size="sm"
      :items="alerts"
    >
      <template #default="{ item, index }">
        <BcrosAlert :alert="item" :index="index" :show-description="false" :contact="contact" />
      </template>
      <template #item="{ item, index }">
        <BcrosAlert :alert="item" :index="index" :show-header="false" :contact="contact" />
      </template>
    </UAccordion>
  </div>
</template>

<script setup lang="ts">
defineProps<{ alerts: Array<Partial<AlertI>>, contact: boolean }>()
</script>
