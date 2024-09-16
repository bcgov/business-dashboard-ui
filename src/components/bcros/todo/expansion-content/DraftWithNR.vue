<script setup lang="ts">
import { GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module/corp-type-module'
import { CorpTypeCd } from '@bcrs-shared-components/enums'
import type { TodoItemI } from '#imports'
import { getApplicantAddress, getNrConditionConsent, getNrRequestType } from '~/utils/nr-utils'
import { NrConsentFlagE } from '~/enums/name-request-consent-flag-e'

const props = defineProps({
  todoItem: { type: Object as PropType<TodoItemI>, required: true }
})

const conditionConsent = getNrConditionConsent(props.todoItem.nameRequest)
</script>

<template>
  <div class="flex flex-row gap-4">
    <div class="flex flex-col w-1/2" data-cy="name-request-info">
      <ul class="ma-0 pa-0">
        <li>
          <label class="font-bold">Name Request</label>
        </li>
        <li class="mt-4">
          <span class="font-bold text-sm pr-1">Entity Type:</span>
          <span class="text-sm">
            {{ GetCorpFullDescription(todoItem.nameRequest.legalType) }}
            {{ todoItem.nameRequest.legalType === CorpTypeCd.SOLE_PROP ? ' or Doing Business As (DBA)' : '' }}
          </span>
        </li>
        <li>
          <span class="font-bold text-sm pr-1">Request Type:</span>
          <span class="text-sm">{{ getNrRequestType(todoItem.nameRequest) }}</span>
        </li>
        <li>
          <span class="font-bold text-sm pr-1">Expiry Date:</span>
          <span class="text-sm">{{ apiToPacificDateTime(todoItem.nameRequest?.expirationDate, true) }}</span>
        </li>
        <li id="status" class="flex flex-row align-middle items-center">
          <UIcon
            v-if="todoItem.nameRequest?.state === NameRequestStateE.APPROVED ||
              todoItem.nameRequest?.state === NameRequestStateE.CONDITIONAL"
            color=""
            class="nr-status-icon text-green-500 -ml-5 text-xl"
            name="i-mdi-check"
          />
          <span class="font-bold text-sm pr-1">Status:</span>
          <span class="text-sm capitalize">{{ todoItem.nameRequest.state }}</span>
        </li>
        <li id="condition-consent" class="flex flex-row align-middle items-center">
          <UIcon
            v-if="conditionConsent === NrConsentFlagE.NOT_REQUIRED_STATE ||
              conditionConsent === NrConsentFlagE.RECEIVED_STATE ||
              conditionConsent === NrConsentFlagE.WAIVED_STATE"
            color=""
            class="nr-status-icon text-green-500 -ml-5 text-xl"
            name="i-mdi-check"
          />

          <UIcon
            v-if="conditionConsent === NrConsentFlagE.NOT_RECEIVED_STATE"
            class="nr-status-icon text-red-500 -ml-5 text-xl"
            name="i-mdi-close"
          />
          <span class="font-bold text-sm pr-1">Condition/Consent:</span>
          <span class="text-sm">{{ conditionConsent }}</span>
        </li>
      </ul>
    </div>
    <div class="flex flex-col w-1/2" data-cy="name-request-applicant-info">
      <ul>
        <li>
          <label class="font-bold">Name Request Applicant</label>
        </li>
        <li class="mt-4">
          <span class="font-bold text-sm pr-1">Name:</span>
          <span class="text-sm">{{ getApplicantName(todoItem.nameRequest?.applicants) }}</span>
        </li>
        <li>
          <span class="font-bold text-sm pr-1">Address:</span>
          <span class="text-sm">{{ getApplicantAddress(todoItem.nameRequest?.applicants) }}</span>
        </li>
        <li>
          <span class="font-bold text-sm pr-1">Email:</span>
          <span class="text-sm">{{ todoItem.nameRequest?.applicants?.emailAddress }}</span>
        </li>
        <li>
          <span class="font-bold text-sm pr-1">Phone:</span>
          <span class="text-sm">{{ todoItem.nameRequest?.applicants?.phoneNumber }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="scss">

</style>
