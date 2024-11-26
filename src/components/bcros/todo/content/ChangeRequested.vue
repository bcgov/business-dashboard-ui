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
      <span class="text-orange-500 font-bold">
        {{ $t('text.todoItem.changeRequested') }}
      </span>
      <BcrosDivider class="ml-1 mr-2" />
      <span>
        Submitted by {{ todoItem.submitter }} on <BcrosTooltipDate :date="dateToString(todoItem.submittedDate)" />
      </span>
    </div>
    <div v-if="linkedNr">
      {{ nrSubtitle(linkedNr) }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
