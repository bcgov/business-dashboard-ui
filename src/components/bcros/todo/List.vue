<template>
  <div
    class="flex flex-col gap-1.5 bg-gray-100"
    data-cy="todoItemList"
  >
    <BcrosTodoItem
      v-for="todoItem in todos"
      :key="todoItem.uiUuid"
      :item="todoItem"
      :title="todoItem.title"
    />
  </div>
</template>

<script setup lang="ts">
import type { TodoItemI } from '~/interfaces/todo-i'

defineProps({
  todos: { type: Array<TodoItemI>, required: true }
})
</script>
