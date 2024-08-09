<script setup lang="ts">
const prop = defineProps({
  todos: { type: Array<TodoItemI>, required: true }
})

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
    class="flex flex-col"
    data-cy="todoItemList"
  >
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
