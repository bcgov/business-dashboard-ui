<template>
  <UAlert
    v-show="!!message && !close"
    class="border-b-2 border-yellow-400 py-0"
    color="orange"
    variant="solid"
    :close-button="false"
    :ui="{ rounded: 'rounded-none', padding: 'p-0', gap: 'app-inner-container py-2' }"
  >
    <template v-if="icon" #icon>
      <!-- NB: needed due to icon sizing via app.config / ui config for alert is not getting applied -->
      <UIcon class="ml-[-2px] text-[34px]" :name="icon" />
    </template>
    <template v-if="message" #description>
      <div class="flex w-full justify-center text-[16px]">
        <span class="blue-links" v-html="message" />
      </div>
    </template>
  </UAlert>
</template>

<script setup lang="ts">
defineProps({
  dismissible: { type: Boolean, default: false },
  icon: { type: String, default: '' },
  message: { type: String, default: '' }
})
const close = ref(false)
</script>

<style>
.blue-links a {
  color: #1669BB;
  text-decoration: underline;
}
</style>
