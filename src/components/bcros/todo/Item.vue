<script setup lang="ts">
import { FilingTypes } from '@bcrs-shared-components/enums'

const todosStore = useBcrosTodos()
const business = useBcrosBusiness()

defineEmits(['expand'])
const prop = defineProps({
  item: { type: Object as PropType<TodoItemI>, required: true },
  expanded: { type: Boolean, required: true }
})

const checkboxChecked: Ref<boolean> = ref(false)
const inProcessFiling: Ref<number> = ref(null)

const name = computed(() =>
  // the 'name' attribute for affiliation invitation is null as there is no matching FilingTypes
  prop.item.name ? prop.item.name : 'affiliation'
)

/** Whether to show the details button with red color. */
const showDetailsBtnRed = (item: TodoItemI): boolean => {
  if (item.status === FilingStatusE.DRAFT) {
    if (item.name === FilingTypes.CORRECTION || item.payErrorObj) { return true }
  }

  if (inProcessFiling.value !== item.filingId) {
    if (item.status === FilingStatusE.ERROR || item.status === FilingStatusE.PAID) { return true }
  }

  return false
}
</script>

<template>
  <div class="flex flex-col gap-0 w-full">
    <div
      class="flex flex-row w-full justify-between px-6 py-5 text-sm"
      :data-cy="'todoItem-header-' + name"
    >
      <div class="flex flex-col" :data-cy="'todoItem-label-' + name">
        <div class="flex flex-row gap-2">
          <div class="font-bold text-base">
            {{ item.title }}
          </div>
          <UButton
            v-if="item.expansionContent"
            variant="ghost"
            leading-icon="i-mdi-information-outline"
            class="-mt-1 h-8"
            :class="showDetailsBtnRed(item) ? 'text-red-500' : ''"
            :data-cy="'todoItem-showMore-' + name"
            :ui="{
              icon: {base: 'ml-3'}
            }"
            @click="$emit('expand', !expanded)"
          >
            <span class="mr-3">
              {{ expanded ? $t('button.todoItem.hideDetails') : $t('button.todoItem.showDetails') }}
            </span>
          </UButton>
        </div>

        <div v-if="item.showAnnualReportCheckbox">
          <div class="pt-2">
            {{ $t('text.todoItem.annualReport.verify') }}
          </div>
          <div class="pt-2" @click.stop>
            <UCheckbox
              v-model="checkboxChecked"
              data-cy="annualReport-checkbox"
              :disabled="item.arCheckboxDisabled"
              :label="$t('text.todoItem.annualReport.checkbox')"
            />
          </div>
        </div>

        <div v-else>
          <!--- Show subtitle string or content template -->
          <BcrosTodoContentNotInGoodStanding
            v-if="item.content === TodoContentE.ALTERING_TO_BEN"
            class="mt-4"
          />
          <BcrosTodoContentPending
            v-if="item.content === TodoContentE.PENDING"
            :todo-item="item"
            :in-process-filing="inProcessFiling"
          />
          <BcrosTodoContentError
            v-if="item.content === TodoContentE.ERROR"
            :todo-item="item"
            :in-process-filing="inProcessFiling"
          />
          <BcrosTodoContentPaid
            v-if="item.content === TodoContentE.PAID"
            :todo-item="item"
            :in-process-filing="inProcessFiling"
          />
          <BcrosTodoContentChangedRequested
            v-if="item.content === TodoContentE.CHANGE_REQUESTED"
            :todo-item="item"
            :in-process-filing="inProcessFiling"
          />
          <span v-if="item.subtitle">
            {{ item.subtitle }}
          </span>
        </div>
      </div>

      <div
        v-if="!!item.affiliationInvitationDetails"
        class="flex flex-row gap-1 ml-auto p-1"
        data-cy="todoItemActions-affiliation"
      >
        <UButton
          variant="outline"
          class="affiliation-action-button"
          data-cy="todoItem-affiliation-doNotAuthorizeButton"
          @click="todosStore.authorize(item.affiliationInvitationDetails.id, false)"
        >
          <span class="w-full text-center"> {{ $t('button.todoItem.doNotAuthorize') }}</span>
        </UButton>
        <UButton
          class="affiliation-action-button"
          data-cy="todoItem-affiliation-authorizeButton"
          @click="todosStore.authorize(item.affiliationInvitationDetails.id, true)"
        >
          <span class="w-full text-center"> {{ $t('button.todoItem.authorize') }}</span>
        </UButton>
      </div>
      <div v-else class="flex flex-col justify-between p-1" :data-cy="'todoItemActions-' + name">
        <!-- special case for BEN/BC/CC/ULC and CBEN/C/CCC/CUL annual report: show due date -->
        <div v-if="item.showAnnualReportDueDate" class="pb-10">
          {{ $t('text.todoItem.annualReport.due') }}: {{ item.arDueDate }}
        </div>
        <div v-if="item.actionButton" :data-cy="'actionButton-' + name" class="flex flex-row justify-beween">
          <!-- loading button when there is a filing in process -->
          <UButton
            v-if="inProcessFiling === item.filingId"
            class="action-button"
            loading
            disabled
          />
          <!-- normal action button -->
          <UButton
            v-else
            :disabled="item.actionButton.disabled || (item.showAnnualReportCheckbox && !checkboxChecked)"
            class="action-button"
            :label="item.actionButton.label"
            @click="() => item.actionButton.actionFn(item)"
          />
          <!-- dropdown menu -->
          <UPopover
            v-if="item.actionButton.menus && item.actionButton.menus.length > 0"
            class="ml-[1px]"
            :popper="{ placement: 'bottom-end' }"
          >
            <UButton
              :ui="{ padding: { default: 'py-0' } }"
              icon="i-mdi-menu-down"
              aria-label="show more options"
              :disabled="!item.enabled"
              data-cy="popover-button"
            />
            <template #panel>
              <UButton
                v-for="(button, index) in item.actionButton.menus"
                :key="index"
                color="primary"
                class="w-full px-5 py-3 my-2"
                variant="ghost"
                :label="item.actionButton.menus[index].label"
                :icon="button.icon"
                :data-cy="'menu-button-' + index"
                @click="()=>item.actionButton.menus[index].actionFn(item)"
              />
            </template>
          </UPopover>
        </div>
      </div>
    </div>
    <transition name="slide-down">
      <div
        v-if="item.expansionContent && expanded"
        class="px-6 pb-5"
        data-cy="todoItem-content"
      >
        <BcrosTodoExpansionContentAffiliation
          v-if="item.expansionContent === TodoExpansionContentE.AFFILIATION_INVITATION"
          :for-business-name="business.currentBusiness.legalName"
          :from-org-name="item.affiliationInvitationDetails?.fromOrgName"
          :additional-message="item.affiliationInvitationDetails?.additionalMessage"
        />
        <BcrosTodoExpansionContentConversionDetails
          v-if="item.expansionContent === TodoExpansionContentE.CONVERSION"
          class="p-3"
          :warnings="item.warnings"
        />
        <BcrosTodoExpansionContentCorrectionComment
          v-if="item.expansionContent === TodoExpansionContentE.CORRECTION"
          class="p-3"
          :comment="item.comment"
        />
        <BcrosTodoExpansionContentPaymentPaid
          v-if="item.expansionContent === TodoExpansionContentE.PAID"
          class="p-3"
        />
        <BcrosTodoExpansionContentPaymentIncomplete
          v-if="item.expansionContent === TodoExpansionContentE.DRAFT_PAYMENT_INCOMPLETE"
          class="p-3"
          :pay-error="item.payErrorObj"
        />
        <BcrosTodoExpansionContentPaymentPending
          v-if="item.expansionContent === TodoExpansionContentE.PENDING_PAYMENT"
          class="p-3"
          :pay-error="item.payErrorObj"
        />
        <BcrosTodoExpansionContentPaymentPendingOnlineBanking
          v-if="item.expansionContent === TodoExpansionContentE.PENDING_PAYMENT_ONLINE"
          class="p-3"
          :draft-title="item.draftTitle"
        />
        <BcrosTodoExpansionContentPaymentUnsuccessful
          v-if="item.expansionContent === TodoExpansionContentE.PAYMENT_ERROR"
          class="p-3"
        />
        <BcrosTodoExpansionContentChangeRequested
          v-if="item.expansionContent === TodoExpansionContentE.CHANGE_REQUESTED"
          class="p-3"
          :todo-item="item"
        />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.action-button {
  @apply px-8 h-8;
}

.affiliation-action-button {
  @apply px-3 w-40 h-8;
}

.slide-down-enter-active,
.slide-down-leave-active {
  transform-origin: top;
  transition: transform 0.3s;
}

.slide-down-enter-to,
.slide-down-leave-from {
  transform: scaleY(1);
}

.slide-down-enter-from,
.slide-down-leave-to {
  transform: scaleY(0);
}
</style>
