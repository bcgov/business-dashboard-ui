<template>
  <div>
    <span class="orange--text text--darken-2">CHANGE REQUESTED</span>
    <UDivider orientation="vertical" :ui="{ border: { base: 'border-gray-600'} }" />
    <span>PAID (filed by {{ todoItem.submitter }} on <DateTooltip :date="todoItem.submittedDate" />)</span>
  </div>
</template>

<script setup lang="ts">
defineProps({
  todoItem: { type: Object as PropType<TodoItemI>, required: true }
})
</script>

<style lang="scss" scoped>
</style>
