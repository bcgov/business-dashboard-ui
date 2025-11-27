<script setup lang="ts">
const props = defineProps({
  displayName: { type: String, required: true }
})
</script>

<template>
  <div class="bg-gray-200" data-cy="todoItemBody-paymentPending">
    <p>
      <strong>{{ $t('text.todoItem.expansionPanel.paymentPending.title') }}</strong>
    </p>
    <p class="pt-3 mb-2">
      {{ $t('text.todoItem.expansionPanel.paymentPending.text1', { displayName: props.displayName }) }}
    </p>
    <p class="mb-2">
      {{ $t('text.todoItem.expansionPanel.paymentPending.text2') }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
</style>
