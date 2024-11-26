<script setup lang="ts">
defineProps({
  inProcessFiling: { type: Number, required: true },
  todoItem: { type: Object as PropType<TodoItemI>, required: true }
})
</script>

<template>
  <!-- error filing -->
  <div>
    <span>{{ $t('text.todoItem.status.pending') }}</span>
    <BcrosDivider class="ml-1 mr-2" />
    <span v-if="inProcessFiling === todoItem.filingId">{{ $t('text.todoItem.status.processing') }}...</span>
    <span v-else>{{ $t('text.todoItem.status.paymentIncomplete') }}</span>
  </div>
</template>

<style lang="scss" scoped>
</style>
