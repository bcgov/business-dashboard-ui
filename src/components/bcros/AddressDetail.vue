<template>
  <div class="flex flex-col pl-3">
    <div class="flex">
      <UIcon name="i-mdi-truck" class="mr-5 text-2xl bg-primary" />
      <div class="flex flex-col">
        <div class="text-gray-900">
          {{ `Delivery Address` }}
        </div>
        <div>
          {{ deliveryAddress }}
        </div>
      </div>
    </div>
    <div class="flex pt-3">
      <UIcon name="i-mdi-email-outline" class="mr-5 text-2xl bg-primary" />
      <div class="flex flex-col">
        <div class="text-gray-900">
          {{ `Mailing Address` }}
        </div>
        <div v-if="mailingAddress">
          {{ mailingAddress }}
        </div>
        <div v-else>
          {{ `Same as above` }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  deliveryAddress: { type: String, required: true },
  mailingAddress: { type: String, default: undefined }
})
</script>
