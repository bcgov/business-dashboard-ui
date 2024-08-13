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
      This business is not in good standing.
    </p>

    <p>
      Before you can alter your business, it must be in good standing with the Business
      Registry. There may be several reasons why a business is not in good standing, but
      the most common reason is an overdue annual report.
    </p>

    <p>
      To resolve this issue, you MUST contact BC Registries staff:
    </p>
    <BcrosContactInfo :contacts="contacts" class="mt-4" />
  </div>
</template>

<style lang="scss" scoped>
</style>
