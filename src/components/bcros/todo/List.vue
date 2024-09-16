<script setup lang="ts">
const t = useNuxtApp().$i18n.t

defineEmits(['reload'])

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
  title: t('text.dialog.error.authorizeAffiliationsError.title'),
  text: t('text.dialog.error.authorizeAffiliationsError.text'),
  textExtra: [t('text.dialog.error.tryAgain')],
  hideClose: true,
  buttons: [{ text: t('button.general.ok'), slotId: 'ok', color: 'primary', onClickClose: true }]
}

const loadAffiliationErrorOptions: DialogOptionsI = {
  title: t('text.dialog.error.loadAffiliationsError.title'),
  text: t('text.dialog.error.loadAffiliationsError.text'),
  textExtra: [t('text.dialog.error.tryAgain')],
  hideClose: true,
  buttons: [{ text: t('button.general.ok'), slotId: 'ok', color: 'primary', onClickClose: true }]
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
  <div>
    <BcrosLegalObligation
      class="mx-24 mb-5"
      :no-tasks="todos.length === 0"
    />
    <div
      id="todoList"
      class="flex flex-col bg-white rounded overflow-hidden"
      data-cy="todoItemList"
    >
      <!-- error dialog (fetching affiliation request) -->
      <BcrosDialog
        attach="#todoList"
        name="loadAffiliationError"
        :display="loadAffiliationError"
        :options="loadAffiliationErrorOptions"
        @close="todosStore.loadAffiliationsError = []"
      />

      <!-- error dialog (accepting affiliation request) -->
      <BcrosDialog
        attach="#todoList"
        name="authorizeAffiliationError"
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
          :expanded="isExpandedInternal[index] || false"
          @expand="expand(index, $event)"
          @reload="$emit('reload')"
        />
      </template>
      <div v-else class="flex flex-col justify-center items-center py-5 bg-white rounded">
        <span class="font-bold">{{ $t('text.todoItem.empty.text1') }}</span>
        <span class="te">{{ $t('text.todoItem.empty.text2') }}</span>
      </div>
    </div>
  </div>
</template>
