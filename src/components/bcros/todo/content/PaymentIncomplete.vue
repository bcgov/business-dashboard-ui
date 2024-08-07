<template>
  <div class="bg-gray-200 p-3">
    <p>
      <strong>Payment Incomplete - {{ payError.title }}</strong>
    </p>
    <p
      class="pt-3 mb-2"
      v-html="payError.detail"
    />
  </div>
</template>

<script setup lang="ts">
defineProps({
  payError: { type: Object as PropType<PaymentErrorI>, required: true }
})
</script>

<style lang="scss" scoped>
</style>
