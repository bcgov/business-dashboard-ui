<script setup lang="ts">
defineProps({
  forBusinessName: { type: String, required: true },
  fromOrgName: { type: String, required: true },
  additionalMessage: { type: String, required: true }
})
</script>

<template>
  <div
    data-cy="todoItemBody-affiliation"
  >
    <p class="pb-4">
      {{ $t('text.todoItem.affiliation.followingAccountsRequest') }}
      {{ forBusinessName }}
      :
    </p>
    <p class="pb-4">
      <strong>{{ fromOrgName }}</strong>
    </p>
    <p class="pb-4">
      {{ $t('text.todoItem.affiliation.onlyAuthorizeIfYouRecognize') }}
    </p>
    <p class="pb-4">
      {{
        $t('text.todoItem.affiliation.allowToManage')
          .replace('AUTHORIZE_TO_ACCOUNT', fromOrgName)
          .replace('AUTHORIZE_FOR_BUSINESS', forBusinessName)
      }}
    </p>
    <div>
      <ul style="list-style-type:disc" class="pl-5">
        <li>{{ $t('text.todoItem.affiliation.appointAndCease') }},</li>
        <li>{{ $t('text.todoItem.affiliation.fileDissolution') }},</li>
        <li>{{ $t('text.todoItem.affiliation.FileAnnualReports') }},</li>
        <li>{{ $t('text.todoItem.affiliation.changeRecordsOffice') }}, {{ $t('text.todoItem.affiliation.and') }}</li>
        <li>{{ $t('text.todoItem.affiliation.authorizeOtherAccountsToManage') }}.</li>
      </ul>
    </div>
    <template v-if="additionalMessage !== ''">
      <p class="py-4">
        {{ $t('text.todoItem.affiliation.requestorMessage') }}:
      </p>
      <p class="pb-4">
        {{ additionalMessage }}
      </p>
    </template>
  </div>
</template>
