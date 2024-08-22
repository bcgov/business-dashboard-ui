<script setup lang="ts">
defineProps({
  payError: { type: Object as PropType<PaymentErrorI>, required: true }
})
</script>

<template>
  <div class="bg-gray-200" data-cy="todoItemBody-paymentIncomplete">
    <p>
      <strong>{{ $t('text.todoItem.expansionPanel.paymentIncomplete.title') }} - {{ payError.title }}</strong>
    </p>
    <p
      class="pt-3 mb-2"
      v-html="payError.detail"
    />
  </div>
</template>

<style lang="scss" scoped>
</style>
