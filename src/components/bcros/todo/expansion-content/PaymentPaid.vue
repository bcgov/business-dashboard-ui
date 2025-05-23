<script setup lang="ts">
import { isAuthorized } from '@/utils/authorizations'
import { AuthorizedActionsE } from '@/enums/authorized-actions-e'

const contacts = getContactInfo('registries')
</script>

<template>
  <div data-cy="todoItemBody-paid">
    <p><strong>{{ $t('text.todoItem.expansionPanel.paymentPaid.title') }}</strong></p>
    <p class="pt-3 mb-2">
      {{ $t('text.todoItem.expansionPanel.paymentPaid.text1') }}
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
