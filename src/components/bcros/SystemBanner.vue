<template>
  <UAlert
    v-show="!!message && !close"
    color="yellow"
    variant="solid"
    :close-button="null"
    :ui="{
      inner: 'py-4',
      rounded: 'rounded-none',
      padding: 'p-0',
      gap: 'app-inner-container items-center'
    }"
  >
    <template #icon>
      <!-- NB: needed due to icon sizing via app.config / ui config for alert is not getting applied -->
      <UIcon class="ml-[-2px] size-7" name="i-mdi-information" />
    </template>
    <template #description>
      <div class="flex w-full">
        <span class="dark-gray-links text-gray-900" v-html="message" />
      </div>
    </template>
  </UAlert>
</template>

<script setup lang="ts">
defineProps({
  dismissible: { type: Boolean, default: false },
  message: { type: String, default: '', required: true }
})
const close = ref(false)
</script>

<style>
.dark-gray-links a {
  color: #212529;
  text-decoration: underline;
}
</style>
