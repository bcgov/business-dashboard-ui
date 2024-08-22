<script setup lang="ts">
const prop = defineProps({
  todoItem: { type: Object as PropType<TodoItemI>, required: true }
})

const submitter = prop.todoItem.submitter
const date = dateToPacificTime(prop.todoItem.submittedDate)
</script>

<template>
  <div class="flex flex-row">
    <span class="orange--text text--darken-2">
      {{ $t('text.todoItem.changeRequested.text1') }}
    </span>
    <UDivider orientation="vertical" :ui="{ border: { base: 'border-gray-600'} }" />
    <span>
      {{ $t('text.todoItem.status.paid') + ' ' }}
      ({{ $t('text.todoItem.changeRequested.text2').replace('SUBMITTER', submitter).replace('DATE', date) }})
    </span>
  </div>
</template>

<style lang="scss" scoped>
</style>
