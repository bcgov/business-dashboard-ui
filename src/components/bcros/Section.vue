<template>
  <div :data-cy="'section_' + name">
    <div :data-cy="'header_' + name" class="font-bold text-lg pb-2">
      <slot name="header" />
    </div>
    <div :data-cy="'body_' + name" class="bg-white rounded overflow-hidden">
      <slot name="default" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  name: { type: String, required: true }
})
</script>
