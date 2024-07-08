<template>
  <div class="flex flex-row" data-cy="todoItemHeader">
    <div
      class="p-1 min-h-12"
      data-cy="todoItemTitle"
    >
      <strong>{{ $t('title.todoItem.affiliationRequest') }}</strong><br />
      <span>{{ $t('title.todoItem.from') }}: {{ todoItem.affiliationInvitationDetails?.fromOrgName }}</span>
    </div>

    <div
      class="p-1"
      data-cy="todoItemExpander"
    >
      <UButton
        variant="ghost"
        leading-icon="i-mdi-information-outline"
        class="p-3 w-40 h-10"
        @click="isExpanded=!isExpanded"
      >
        {{ isExpanded ? $t('button.todoItem.hideDetails') : $t('button.todoItem.showDetails') }}
      </UButton>
    </div>

    <div class="flex flex-row gap-1 ml-auto p-1" data-cy="todoItemActions">
      <UButton
        variant="outline"
        class="px-3 w-40 h-10"
        data-cy="todoItem-doNotAuthorizeButton"
        @click="todosStore.authorize(todoItem.affiliationInvitationDetails.id, false)"
      >
        <span class="w-full text-center"> {{ $t('button.todoItem.doNotAuthorize') }}</span>
      </UButton>
      <UButton
        class="px-3 w-40 h-10"
        data-cy="todoItem-authorizeButton"
        @click="todosStore.authorize(todoItem.affiliationInvitationDetails.id, true)"
      >
        <span class="w-full text-center"> {{ $t('button.todoItem.authorize') }}</span>
      </UButton>
    </div>
  </div>
  <div
    :class=" !isExpanded ? 'hidden' : '' "
    data-cy="todoItemBody"
  >
    <p class="pb-4">
      {{ $t('text.todoItem.followingAccountsRequest') }}
      {{ forBusinessName }}
      :
    </p>
    <p class="pb-4">
      <strong>{{ todoItem.affiliationInvitationDetails?.fromOrgName }}</strong>
    </p>
    <p class="pb-4">{{ $t('text.todoItem.onlyAuthorizeIfYouRecognize') }}</p>
    <p class="pb-4">
      {{
        $t('text.todoItem.allowToManage')
          .replace('AUTHORIZE_TO_ACCOUNT', todoItem.affiliationInvitationDetails?.fromOrgName)
          .replace('AUTHORIZE_FOR_BUSINESS', forBusinessName)
      }}
    </p>
    <div>
      <ul style="list-style-type:disc" class="pl-5">
        <li>{{ $t('text.todoItem.appointAndCease') }},</li>
        <li>{{ $t('text.todoItem.fileDissolution') }},</li>
        <li>{{ $t('text.todoItem.FileAnnualReports') }},</li>
        <li>{{ $t('text.todoItem.changeRecordsOffice') }}, {{ $t('text.todoItem.and') }}</li>
        <li>{{ $t('text.todoItem.authorizeOtherAccountsToManage') }}.</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue'
import type { TodoItemI } from '~/interfaces/todo-i'

const todosStore = useBcrosTodos()

const props = defineProps({
  todoItem: { type: Object as PropType<TodoItemI>, required: true },
  startExpanded: { type: Boolean, default: false },
  forBusinessName: { type: String, required: true }
})

const isExpanded = ref(props.startExpanded)
</script>
