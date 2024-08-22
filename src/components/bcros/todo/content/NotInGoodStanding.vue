<script setup lang="ts">
const contacts = getContactInfo('registries')
</script>

<template>
  <!-- draft alteration to a BEN not in good standing ---- TEMPLATE ---- -->
  <div
    class="flex flex-col items-start"
  >
    <p class="font-bold text-red-500">
      <UIcon name="i-mdi-alert" class="text-orange-500" />
      {{ $t('text.todoItem.notInGoodStanding.text1') }}
    </p>

    <p>
      {{ $t('text.todoItem.notInGoodStanding.text2') }}
    </p>

    <p>
      {{ $t('text.todoItem.notInGoodStanding.text3') }}
    </p>
    <BcrosContactInfo :contacts="contacts" class="mt-4" />
  </div>
</template>

<style lang="scss" scoped>
</style>
