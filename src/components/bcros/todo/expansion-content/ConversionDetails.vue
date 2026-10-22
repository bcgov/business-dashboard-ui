<script setup lang="ts">
defineProps({
  warnings: { type: Array<string>, required: true },
  textPath: { type: String, default: 'text.todoItem.expansionPanel.conversionDetails.text' },
  dataCy: { type: String, default: 'todoItemBody-conversion' }
})
</script>

<template>
  <div :data-cy="dataCy">
    <p>
      {{ $t(textPath) }}
    </p>
    <ul v-if="warnings.length > 0" class="list-disc ml-8">
      <li
        v-for="(item, index) in warnings"
        :key="index"
        class="pl-2"
      >
        {{ item }}
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
</style>
