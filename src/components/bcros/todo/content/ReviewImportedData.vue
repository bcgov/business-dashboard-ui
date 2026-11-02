<script setup lang="ts">
defineProps({
  warnings: { type: Array<string>, required: true }
})
</script>

<template>
  <!-- review imported data todo: always shown, no expansion panel -->
  <div class="flex flex-col items-start gap-3" data-cy="todoItemBody-reviewImportedData">
    <p data-cy="todoItem-reviewImportedData-subtitle">
      {{ $t('text.todoItem.reviewImportedData.subtitle') }}
    </p>
    <BcrosTodoExpansionContentConversionDetails
      :warnings="warnings"
      text-path="text.todoItem.reviewImportedData.text"
      data-cy="todoItemBody-reviewImportedData-list"
    />
  </div>
</template>
