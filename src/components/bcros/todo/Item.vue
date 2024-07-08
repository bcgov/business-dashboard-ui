<template>
  <div data-cy="todoItem" class="flex flex-col gap-2 w-full px-6 py-5">
    <BcrosTodoItemsAffiliation
      v-if="displayItem===DisplayItem.AffiliationInvitation"
      :todo-item="item"
      :for-business-name="business.currentBusiness.legalName"
    />

    <div v-if="displayItem===DisplayItem.None">
      NONE NONE
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TodoItemI } from '~/interfaces/todo-i'

const business = useBcrosBusiness()

const props = defineProps({
  item: { type: Object as PropType<TodoItemI>, required: true }
})

enum DisplayItem {
  None,
  AffiliationInvitation
}

let displayItem = DisplayItem.None

if (props.item.affiliationInvitationDetails) {
  displayItem = DisplayItem.AffiliationInvitation
}

</script>
