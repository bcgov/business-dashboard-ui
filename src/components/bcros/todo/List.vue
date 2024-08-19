<script setup lang="ts">
const todosStore = useBcrosTodos()

const prop = defineProps({
  todos: { type: Array<TodoItemI>, required: true }
})

const authorizeAffiliationError = computed(() => {
  return todosStore.authorizeAffiliationsErrors.length > 0
})

const loadAffiliationError = computed(() => {
  return todosStore.loadAffiliationsError.length > 0
})

const authorizeAffiliationErrorOptions: DialogOptionsI = {
  title: 'Error updating affiliation invitation.',
  text: 'An error happened while updating affiliation invitation.',
  textExtra: ['Please try again later.'],
  hideClose: true,
  buttons: [{ text: 'OK', slotId: 'ok', color: 'primary', onClickClose: true }]
}

const loadAffiliationErrorOptions: DialogOptionsI = {
  title: 'Error fetching affiliation invitation.',
  text: 'An error happened while fetching affiliation invitation.',
  textExtra: ['Please try again later.'],
  hideClose: true,
  buttons: [{ text: 'OK', slotId: 'ok', color: 'primary', onClickClose: true }]
}

const isExpandedInternal: Ref<boolean[]> = ref([])

const isExpanded = computed({
  get () {
    isExpandedInternal.value = new Array(prop.todos.length).fill(false)
    return isExpandedInternal.value
  },
  set (newValue: boolean[]) {
    isExpandedInternal.value = newValue
  }
})

const expand = (index: number, expanded: boolean) => {
  for (let i = 0; i < isExpanded.value.length; i++) {
    if (i === index) {
      isExpanded.value[i] = expanded
    } else {
      isExpanded.value[i] = false
    }
  }
}
</script>

<template>
  <div
    id="todoList"
    class="flex flex-col"
    data-cy="todoItemList"
  >
    <!-- error dialog (fetching affiliation request) -->
    <BcrosDialog
      attach="#todoList"
      :display="loadAffiliationError"
      :options="loadAffiliationErrorOptions"
      @close="todosStore.loadAffiliationsError = []"
    />

    <!-- error dialog (accepting affiliation request) -->
    <BcrosDialog
      attach="#todoList"
      :display="authorizeAffiliationError"
      :options="authorizeAffiliationErrorOptions"
      @close="todosStore.authorizeAffiliationsErrors = []"
    />

    <template v-if="todos.length > 0">
      <BcrosTodoItem
        v-for="(todoItem, index) in todos"
        :key="todoItem.uiUuid"
        :item="todoItem"
        :class="index !== todos.length-1 ? 'border-b border-gray-400' : ''"
        :expanded="isExpandedInternal[index]"
        @expand="expand(index, $event)"
      />
    </template>
    <div v-else class="flex flex-col justify-center items-center py-5 bg-white rounded">
      <span class="font-bold">{{ $t('text.todoItem.empty.text1') }}</span>
      <span class="te">{{ $t('text.todoItem.empty.text2') }}</span>
    </div>
  </div>
</template>
