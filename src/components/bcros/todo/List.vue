<template>
  <div
    class="flex flex-col"
    data-cy="todoItemList"
  >
    <template v-if="todos.length > 0">
      <BcrosTodoItem
        v-for="(todoItem, index) in todos"
        :key="todoItem.uiUuid"
        :item="todoItem"
        :class="index !== todos.length-1 ? 'border-b border-gray-400' : ''"
      />
    </template>
    <div v-else class="flex flex-col justify-center items-center py-5 bg-white rounded">
      <span class="font-bold">{{ $t('text.todoItem.empty.text1') }}</span>
      <span class="te">{{ $t('text.todoItem.empty.text2') }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TodoItemI } from '~/interfaces/todo-i'

defineProps({
  todos: { type: Array<TodoItemI>, required: true }
})
</script>
