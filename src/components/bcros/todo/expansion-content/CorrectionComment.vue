<script setup lang="ts">
defineProps({
  comment: { type: String, required: true }
})
</script>

<template>
  <div class="bg-gray-200" data-cy="todoItemBody-correction">
    <p>
      {{ $t('text.todoItem.expansionPanel.correctionComment.text1') }}<br>
      {{ $t('text.todoItem.expansionPanel.correctionComment.text2') }}
    </p>
    <UDivider class="my-6" />
    <template v-if="comment">
      <p class="mb-2">
        <UIcon name="i-mdi-message-text-outline" />
        <span class="ml-1">Detail</span>
      </p>
      <p class="body-2 detail-body pre-line pt-4 mb-0">
        {{ comment }}
      </p>
    </template>
  </div>
</template>

<style lang="scss" scoped>
</style>
