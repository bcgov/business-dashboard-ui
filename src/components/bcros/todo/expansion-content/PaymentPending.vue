<script setup lang="ts">
defineProps({
  payError: { type: Object as PropType<PaymentErrorI>, required: true }
})
</script>

<template>
  <div class="bg-gray-200" data-cy="todoItemBody-paymentPending">
    <p>
      <strong>{{ $t('text.todoItem.expansionPanel.paymentPending.title') }}</strong>
    </p>
    <p class="pt-3 mb-2">
      {{ $t('text.todoItem.expansionPanel.paymentPending.text1') }}
    </p>
    <p class="mb-2">
      {{ $t('text.todoItem.expansionPanel.paymentPending.text2') }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
</style>
