<template>
  <div class="bg-gray-200" data-cy="todoItemBody-paymentPending">
    <p>
      <strong>Payment Incomplete</strong>
    </p>
    <p class="pt-3 mb-2">
      This filing is pending payment. The payment may still be in progress or may have been
      interrupted for some reason.
    </p>
    <p class="mb-2">
      You may continue this filing by selecting "Resume Payment".
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  payError: { type: Object as PropType<PaymentErrorI>, required: true }
})
</script>

<style lang="scss" scoped>
</style>
