<script setup lang="ts">
const { isStaffAccount } = useBcrosAccount()
const contacts = getContactInfo('registries')
</script>

<template>
  <div data-cy="todoItemBody-paid">
    <p><strong>Paid</strong></p>
    <p class="pt-3 mb-2">
      This filing is paid but the filing is not yet complete. Please check again later.
    </p>
    <template v-if="!isStaffAccount">
      <p>
        If this error persists, please contact us.
      </p>
      <BcrosContactInfo :contacts="contacts" class="mt-5" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
</style>
