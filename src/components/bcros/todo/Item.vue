<script setup lang="ts">
const t = useNuxtApp().$i18n.t
const todosStore = useBcrosTodos()
const { currentBusinessIdentifier, currentBusinessName } = storeToRefs(useBcrosBusiness())
const { bootstrapIdentifier } = storeToRefs(useBcrosBusinessBootstrap())
const runtimeConfig = useRuntimeConfig()

const showConfirmDialog = ref(false)
const hasDeleteError = ref(false)
const hasCancelPaymentError = ref(false)
const confirmDialog = ref<DialogOptionsI | null>(null)

const emit = defineEmits(['expand', 'reload'])

const prop = defineProps({
  item: { type: Object as PropType<TodoItemI>, required: true },
  expanded: { type: Boolean, required: true }
})

const checkboxChecked: Ref<boolean> = ref(false)
const inProcessFiling: Ref<number> = ref(null)

// errors and warnings from API calls for deleting a draft or cancelling a payment
const deleteErrors = ref([])
const deleteWarnings = ref([])
const cancelPaymentErrors = ref([])

const name = computed(() =>
  // the 'name' attribute for affiliation invitation is null as there is no matching FilingTypes
  prop.item.name ? prop.item.name : 'affiliation'
)

// dialog options config
const confirmDeleteDraft: DialogOptionsI = {
  title: t('text.dialog.confirmDeleteDraft.title'),
  text: t('text.dialog.confirmDeleteDraft.text').replace('DRAFT_TITLE', prop.item.draftTitle),
  hideClose: true,
  buttons: [
    { text: t('button.dialog.delete'), slotId: 'delete', color: 'primary', onClick: () => deleteDraft() },
    { text: t('button.dialog.cancel'), slotId: 'cancel', color: 'primary', onClickClose: true }
  ]
}

const confirmCancelPayment: DialogOptionsI = {
  title: t('text.dialog.confirmCancelPayment.title'),
  text: t('text.dialog.confirmCancelPayment.text').replace('DRAFT_TITLE', prop.item.draftTitle),
  hideClose: true,
  buttons: [
    {
      text: t('button.dialog.cancelPayment'),
      slotId: 'delete',
      color: 'primary',
      onClick: () => cancelPaymentAndSetToDraft()
    },
    { text: t('button.dialog.dontCancelPayment'), slotId: 'cancel', color: 'primary', onClickClose: true }
  ]
}

/** Handle the click event for the passed-in action button.
 *  Execute the action function if it exists, and open the dialog if needed.
 */
const handleClick = (button: ActionButtonI) => {
  if (button.actionFn) {
    button.actionFn(prop.item)
  }

  if (button.openDialog) {
    const businessId = currentBusinessIdentifier.value

    if (prop.item.status === FilingStatusE.DRAFT) {
      // open the dialog for confirming deleting a draft filing (for existing businesses and temp business)
      if (businessId || bootstrapIdentifier.value) { confirmDialog.value = confirmDeleteDraft }
    } else if (prop.item.status === FilingStatusE.PENDING) {
      // open the dialog for confirming cancelling a payment for a pending filing with payment error
      confirmDialog.value = confirmCancelPayment
    }

    showConfirmDialog.value = true
  }
}

/** Whether to show the error style for the button (red text and red hover background) and the top border (red). */
const useErrorStyle = (item: TodoItemI): boolean => {
  if (item.status === FilingStatusE.DRAFT) {
    if (item.payErrorObj) { return true }
  }

  if (inProcessFiling.value !== item.filingId) {
    if (item.status === FilingStatusE.ERROR || item.status === FilingStatusE.PAID) { return true }
  }

  return false
}

/** Delete a draft; if refreshDashboard is set to true, refresh the page to reload data */
const deleteDraft = async (refreshDashboard = true): Promise<void> => {
  const id = currentBusinessIdentifier.value || bootstrapIdentifier.value
  const url = `${runtimeConfig.public.legalApiURL}/businesses/${id}/filings/${prop.item.filingId}`
  await useBcrosFetch(url, { method: 'DELETE' }).then(({ error }) => {
    showConfirmDialog.value = false
    if (error.value) {
      console.error('Error deleting a draft: ', error.value)
      hasDeleteError.value = true
      if (error.value.data.errors) { deleteErrors.value = error.value.data.errors }
      if (error.value.data.warnings) { deleteWarnings.value = error.value.data.warnings }
    } else if (refreshDashboard) {
      emit('reload')
    }
  })
}

/** Cancel the payment and set the filing status to draft; reload the page; handle errors if exist */
const cancelPaymentAndSetToDraft = async (_refreshDashboard = true): Promise<void> => {
  const bId = currentBusinessIdentifier.value || bootstrapIdentifier.value
  const url =
    `${runtimeConfig.public.legalApiURL}/businesses/${bId}/filings/${prop.item.filingId}`

  await useBcrosFetch(url, { method: 'PATCH' }).then(({ error }) => {
    showConfirmDialog.value = false
    if (error.value) {
      console.error('Error cancelling a payment: ', error.value)
      hasCancelPaymentError.value = true
    } else {
      emit('reload')
    }
  })
}

/** Clear the error flag, errors and warning array for deleting a draft */
const clearDeleteErrors = (): void => {
  hasDeleteError.value = false
  deleteErrors.value = []
  deleteWarnings.value = []
}

/** Clear the error flag and errors array for cancelling a payment */
const clearCancelPaymentErrors = (): void => {
  hasCancelPaymentError.value = false
  cancelPaymentErrors.value = []
}
</script>

<template>
  <div class="flex flex-col gap-0 w-full">
    <!-- confirm dialog -->
    <BcrosDialog
      attach="#todoList"
      name="confirm"
      :display="showConfirmDialog"
      :options="confirmDialog"
      @close="showConfirmDialog = false"
    />

    <!-- error dialog (deleting draft) -->
    <BcrosTodoDialogDeleteError
      :display="hasDeleteError"
      :errors="deleteErrors"
      :warnings="deleteWarnings"
      @close="clearDeleteErrors()"
    />

    <!-- error dialog (cancelling payment) -->
    <BcrosTodoDialogCancelPaymentError
      :display="hasCancelPaymentError"
      :errors="cancelPaymentErrors"
      @close="clearCancelPaymentErrors()"
    />

    <div
      class="flex flex-row w-full justify-between px-6 py-5 text-sm"
      :class="useErrorStyle(item) ? 'border-0 border-t-2 border-t-red-600' : ''"
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
            :class="useErrorStyle(item) ? 'text-red-600 hover:bg-red-100' : ''"
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
          <BcrosTodoContentChangeRequested
            v-if="item.content === TodoContentE.CHANGE_REQUESTED"
            :todo-item="item"
            :in-process-filing="inProcessFiling"
          />
          <BcrosTodoContentApprovedContinuationIn
            v-if="item.content === TodoContentE.APPROVED_CONTINUATION_IN"
            :todo-item="item"
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
        <div
          v-if="item.actionButton"
          :data-cy="'actionButton-' + name"
          class="flex flex-row justify-beween rounded overflow-hidden"
        >
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
            @click="() => handleClick(item.actionButton)"
          />
          <!-- dropdown menu -->
          <UPopover
            v-if="item.actionButton.menus && item.actionButton.menus.length > 0"
            class="ml-[1px]"
            :popper="{ placement: 'bottom-end', offsetDistance: 1 }"
          >
            <UButton
              :ui="{ padding: { default: 'py-0' } }"
              class="rounded-none"
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
                @click="()=>handleClick(item.actionButton.menus[index])"
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
          :for-business-name="currentBusinessName"
          :from-org-name="item.affiliationInvitationDetails?.fromOrgName"
          :additional-message="item.affiliationInvitationDetails?.additionalMessage"
        />
        <BcrosTodoExpansionContentConversionDetails
          v-if="item.expansionContent === TodoExpansionContentE.CONVERSION"
          :warnings="item.warnings"
        />
        <BcrosTodoExpansionContentCorrectionComment
          v-if="item.expansionContent === TodoExpansionContentE.DRAFT_CORRECTION"
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
          :todo-item="item"
        />
        <BcrosTodoExpansionContentDraftWithNR
          v-if="item.expansionContent === TodoExpansionContentE.DRAFT_WITH_NR"
          :todo-item="item"
        />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.action-button {
  @apply px-8 h-8 rounded-none;
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
