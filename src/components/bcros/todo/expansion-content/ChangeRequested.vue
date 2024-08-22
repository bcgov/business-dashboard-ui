<script setup lang="ts">
defineProps({
  todoItem: { type: Object as PropType<TodoItemI>, required: true }
})
</script>

<template>
  <div data-cy="todoItemBody-changeRequested">
    <p class="mb-2">
      {{ $t('text.todoItem.expansionPanel.changeRequested.text').replace('TITLE', todoItem.title) }}
    </p>
    <p class="italic">
      {{ todoItem.latestReviewComment || '[undefined staff change request message]' }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
</style>
