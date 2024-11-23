<script setup lang="ts">
import { FilingTypes } from '@bcrs-shared-components/enums'
import { isTodoFilingType } from '~/utils/todo/task-filing/helper'

defineProps({
  inProcessFiling: { type: Number, required: true },
  todoItem: { type: Object as PropType<TodoItemI>, required: true }
})
</script>

<template>
  <!-- pending (or pending correction) filing -->
  <div
    class="flex flex-col items-start"
  >
    <template
      v-if="isTodoFilingType(todoItem, FilingTypes.CORRECTION) || isTodoFilingType(todoItem, FilingTypes.ALTERATION)"
    >
      <span v-if="inProcessFiling === todoItem.filingId">{{ $t('text.todoItem.status.processing') }}...</span>
      <span v-else>{{ $t('text.todoItem.status.pending') }}</span>
    </template>

    <div v-else class="break-words">
      <span>{{ $t('text.todoItem.status.pending') }}</span>
      <BcrosDivider />
      <span v-if="inProcessFiling === todoItem.filingId">{{ $t('text.todoItem.status.processing') }}...</span>
      <span v-else-if="todoItem.paymentMethod === PaymentMethodE.ONLINE_BANKING">
        {{ $t('text.todoItem.status.pendingOnlineBanking') }}
      </span>
      <span v-else-if="todoItem.isPayCompleted">{{ $t('text.todoItem.status.paymentCompleted') }}</span>
      <span v-else>{{ $t('text.todoItem.status.paymentIncomplete') }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
</style>
