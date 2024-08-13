<script setup lang="ts">
defineProps({
  todoItem: { type: Object as PropType<TodoItemI>, required: true }
})
</script>

<template>
  <div class="flex flex-row">
    <span class="orange--text text--darken-2">CHANGE REQUESTED</span>
    <UDivider orientation="vertical" :ui="{ border: { base: 'border-gray-600'} }" />
    <span>
      PAID (filed by {{ todoItem.submitter }} on <BcrosTooltipDate :date="dateToPacificTime(todoItem.submittedDate)" />)
    </span>
  </div>
</template>

<style lang="scss" scoped>
</style>
