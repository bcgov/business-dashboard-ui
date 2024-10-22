<script setup lang="ts">
defineProps({
  todoItem: { type: Object as PropType<TodoItemI>, required: true }
})

const { linkedNr } = storeToRefs(useBcrosBusinessBootstrap())
</script>

<template>
  <!-- pending (or pending correction) filing -->
  <div
    class="flex flex-col gap-2 items-start"
  >
    <div class="flex flex-row gap-2 w-full">
      <span class="text-orange-500 font-bold">
        {{ $t('text.todoItem.changeRequested') }}
      </span>
      <UDivider orientation="vertical" :ui="{ border: { base: 'border-gray-600'} }" />
      <div>
        Submitted by {{ todoItem.submitter }} on <BcrosTooltipDate :date="dateToString(todoItem.submittedDate)" />
      </div>
    </div>
    <div v-if="linkedNr">
      {{ nrSubtitle(linkedNr) }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
