<template>
  <div class="bg-gray-200 p-3">
    <p>
      This filing is in review and has been saved as a draft.<br>
      Normal processing times are 2 to 5 business days. Priority processing times are 1 to 2 business days.
    </p>
    <UDivider class="my-6" />
    <template v-if="comment">
      <p class="mb-2">
        <UIcon name="i-mdi-message-reply" />
        <span class="ml-1">Detail</span>
      </p>
      <p class="body-2 detail-body pre-line pt-4 mb-0">
        {{ comment }}
      </p>
    </template>
  </div>
</template>

<script setup lang="ts">
defineProps({
  comment: { type: String, required: true }
})
</script>

<style lang="scss" scoped>
</style>
