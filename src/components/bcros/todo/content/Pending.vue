<template>
  <!-- pending (or pending correction) filing -->
  <div
    class="flex flex-col items-start"
  >
    <template
      v-if="isTodoFilingType(todoItem, FilingTypes.CORRECTION) || isTodoFilingType(todoItem, FilingTypes.ALTERATION)"
    >
      <span v-if="inProcessFiling === todoItem.filingId">PROCESSING...</span>
      <span v-else>FILING PENDING</span>
    </template>

    <template v-else>
      <span>FILING PENDING</span>
      <UDivider orientation="vertical" :ui="{ border: { base: 'border-gray-600'} }" />
      <span v-if="inProcessFiling === todoItem.filingId">PROCESSING...</span>
      <span v-else-if="todoItem.paymentMethod === PaymentMethodE.ONLINE_BANKING">ONLINE BANKING PAYMENT PENDING</span>
      <span v-else-if="todoItem.isPayCompleted">PAYMENT COMPLETED</span>
      <span v-else>PAYMENT INCOMPLETE</span>
    </template>
  </div>
</template>

<script setup lang="ts">
import { FilingTypes } from '@bcrs-shared-components/enums'
import { isTodoFilingType } from '~/utils/todo/task-filing/helper'

defineProps({
  inProcessFiling: { type: Number, required: true },
  todoItem: { type: Object as PropType<TodoItemI>, required: true }
})
</script>

<style lang="scss" scoped>
</style>
