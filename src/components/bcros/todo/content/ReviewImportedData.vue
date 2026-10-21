<script setup lang="ts">
defineProps({
  warnings: { type: Array<string>, required: true }
})
</script>

<template>
  <!-- review imported data todo: always shown, no expansion panel -->
  <div class="flex flex-col items-start gap-3" data-cy="todoItemBody-reviewImportedData">
    <BcrosTodoExpansionContentConversionDetails
      :warnings="warnings"
      text-path="text.todoItem.reviewImportedData.text"
      data-cy="todoItemBody-reviewImportedData-list"
    />
    <div
      class="flex flex-row items-start gap-2 p-3 rounded bg-red-50 border border-red-600 text-red-600"
      data-cy="todoItem-reviewImportedData-alert"
    >
      <UIcon name="i-mdi-alert" class="text-xl mt-0.5 shrink-0" />
      <p>
        <span class="font-bold">{{ $t('text.todoItem.reviewImportedData.important') }}</span>
        {{ $t('text.todoItem.reviewImportedData.importantText') }}
      </p>
    </div>
  </div>
</template>
