<script setup lang="ts">
import { isAuthorized } from '@/utils/authorizations'
import { AuthorizedActionsE } from '@/enums/authorized-actions-e'

const props = defineProps({
  displayName: { type: String, required: true }
})

const contacts = getContactInfo('registries')
</script>

<template>
  <UDivider />
  <div data-cy="todoItemBody-paid">
    <p class="pt-5 mb-2">
      {{ $t('text.todoItem.expansionPanel.paymentPaid.text1', { displayName: props.displayName }) }}
    </p>
    <template v-if="!isAuthorized(AuthorizedActionsE.NO_CONTACT_INFO)">
      <p>
        {{ $t('text.todoItem.expansionPanel.paymentPaid.text2') }}
      </p>
      <BcrosContactInfo :contacts="contacts" class="mt-5" />
    </template>
  </div>
</template>

<style lang="scss" scoped>
</style>
