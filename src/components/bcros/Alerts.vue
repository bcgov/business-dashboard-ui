<template>
  <div data-cy="alert-display">
    <div
      v-for="alert, i in alerts"
      :key="`alert-${i}`"
      data-cy="alert-line"
    >
      <BcrosAlert :alert="alert" :contact="contact" />
    </div>
  </div>
</template>

<script setup lang="ts">

const props = defineProps<{ alerts: Array<Partial<AlertI>>, contact: boolean }>()

</script>
