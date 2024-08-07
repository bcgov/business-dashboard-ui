<template>
  <div class="p-3">
    <p><strong>Paid</strong></p>
    <p class="pt-3 mb-2">
      This filing is paid but the filing is not yet complete. Please check again later.
    </p>
    <template v-if="isRoleStaff">
      <p>
        If this error persists, please contact us.
      </p>
      <BcrosContactInfo :contacts="contacts" class="mt-5" />
    </template>
  </div>
</template>

<script setup lang="ts">
const account = useBcrosAccount()
const isRoleStaff = account && account.currentAccount.accountType !== AccountTypeE.STAFF
const contacts = getContactInfo('registries')
</script>

<style lang="scss" scoped>
</style>
