<script setup lang="ts">
defineProps({
  todoItem: { type: Object as PropType<TodoItemI>, required: true }
})
const contacts = getContactInfo('registries')
</script>

<template>
  <div data-cy="todoItemBody-changeRequested">
    <UDivider class="mb-2" :ui="{ border: { base: 'border-gray-200'} }" />
    <div class="mb-2">
      {{ $t('text.todoItem.expansionPanel.changeRequested.continuationIn') }}
    </div>
    <div class="bg-gray-200 py-3 px-5">
      {{ todoItem.latestReviewComment || '[undefined staff change request message]' }}
    </div>
    <BcrosContactInfo :contacts="contacts" class="mt-5" />
  </div>
</template>

<style lang="scss" scoped>
</style>
