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
    <div>
      <span>Continuation Authorization APPROVED</span>
      <BcrosDivider class="mx-2" />
      <span>Submitted by {{ todoItem.submitter }} on </span>
      <BcrosTooltipDate :date="dateToString(todoItem.submittedDate)" />
    </div>
    <div v-if="linkedNr">
      {{ nrSubtitle(linkedNr) }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
