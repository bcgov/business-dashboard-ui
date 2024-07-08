<template>
  <BcrosTodoItem
    v-for="todoItem in todos"
    :key="todoItem.uiUuid"
    :item="todoItem"
    :title="todoItem.title"
  />
</template>

<script setup lang="ts">
import type { TodoItemI } from '~/interfaces/todo-i'

defineProps({
  todos: { type: Array<TodoItemI>, required: true }
})
</script>
