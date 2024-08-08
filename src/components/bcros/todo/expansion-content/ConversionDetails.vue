<template>
  <div class="bg-gray-200" data-cy="todoItemBody-conversion">
    <p class="mb-2">
      BC Registries is missing information about this business.
    </p>
    <ul v-if="warnings.length > 0">
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

<script setup lang="ts">
defineProps({
  warnings: { type: Array<string>, required: true }
})
</script>

<style lang="scss" scoped>
</style>
