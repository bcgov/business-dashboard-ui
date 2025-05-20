<template>
  <UButton
    :class="['px-10 py-2', button.class || '']"
    :color="button.color ? button.color : 'primary'"
    :label="button.text"
    :disabled="disabled"
    :loading="loading"
    @click="emit('click')"
  />
</template>

<script setup lang="ts">
const props = defineProps<{
  button: DialogButtonI,
  loading?: boolean,
  disabled?: boolean
}>()
const emit = defineEmits<{
  (e:'close'): void,
  (e:'click'): void
}>()

</script>
