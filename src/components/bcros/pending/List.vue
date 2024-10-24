<script setup lang="ts">
defineProps({
  pendingFilings: { type: Array<any>, required: true }
})
</script>

<template>
  <div
    id="pendingReview"
    class="flex flex-col bg-white rounded overflow-hidden"
    data-cy="pendingReview"
  >
    <BcrosPendingItem
      v-for="(filing, index) in pendingFilings"
      :key="index"
      :item="filing"
    />
  </div>
</template>
