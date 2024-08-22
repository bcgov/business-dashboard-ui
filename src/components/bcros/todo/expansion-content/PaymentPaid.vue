<script setup lang="ts">
const { isStaffAccount } = useBcrosAccount()
const contacts = getContactInfo('registries')
</script>

<template>
  <div data-cy="todoItemBody-paid">
    <p><strong>{{ $t('text.todoItem.expansionPanel.paymentPaid.title') }}</strong></p>
    <p class="pt-3 mb-2">
      {{ $t('text.todoItem.expansionPanel.paymentPaid.text1') }}
    </p>
    <template v-if="!isStaffAccount">
      <p>
        {{ $t('text.todoItem.expansionPanel.paymentPaid.text2') }}
      </p>
      <BcrosContactInfo :contacts="contacts" class="mt-5" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
</style>
