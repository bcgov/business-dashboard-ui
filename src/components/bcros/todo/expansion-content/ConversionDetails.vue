<script setup lang="ts">
defineProps({
  warnings: { type: Array<string>, required: true }
})
</script>

<template>
  <div data-cy="todoItemBody-conversion">
    <p>
      {{ $t('text.todoItem.expansionPanel.conversionDetails.text') }}
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
