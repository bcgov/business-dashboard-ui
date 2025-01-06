<script lang="ts" setup>
const open = defineModel('open', { type: Boolean, required: true })
defineProps({ spinnerText: { type: String, required: false, default: undefined } })
</script>

<template>
  <UModal
    v-model="open"
    prevent-close
    transition
    :ui="{
      background: 'bg-transparent',
      shadow: 'shadow-none',
      overlay: {
        background: 'bg-gray-800/75 dark:bg-gray-800/75',
      }
    }"
  >
    <div class="w-full h-full text-center items-center">
      <UIcon class="text-6xl text-gray-700 animate-spin" name="i-mdi-loading" data-cy="loading-icon" />
      <p v-if="spinnerText" class="text-white font-semibold">
        {{ spinnerText }}
      </p>
    </div>
  </UModal>
</template>
