<script setup lang="ts">
defineProps({
  todoItem: { type: Object as PropType<TodoItemI>, required: true }
})

const { linkedNr } = storeToRefs(useBcrosBusinessBootstrap())
</script>

<template>
  <!-- pending (or pending correction) filing -->
  <div
    class="flex flex-col items-start"
  >
    <div class="flex flex-row gap-2 w-full">
      <span>Continuation Authorization APPROVED</span>
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
