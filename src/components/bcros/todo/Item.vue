<template>
  <div class="flex flex-col gap-0 w-full">
    <div
      class="flex flex-row w-full px-6 py-5 text-sm"
      :data-cy="'todoItem-header-' + name"
    >
      <div class="flex flex-col w-full" :data-cy="'todoItem-label-' + name">
        <div class="flex flex-row gap-2">
          <div class="font-bold text-base">
            {{ item.title }}
          </div>
          <!-- TO-DO: The 'View Detail' button can be either blue or red, depending on the type of todo items -->
          <UButton
            v-if="item.contentPanel"
            variant="ghost"
            leading-icon="i-mdi-information-outline"
            class="-mt-1 h-8"
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
          {{ item.subtitle }}
        </div>
      </div>

      <div
        v-if="!!item.affiliationInvitationDetails"
        class="flex flex-row gap-1 ml-auto p-1"
        data-cy="todoItemActions-affiliation"
      >
        <UButton
          variant="outline"
          class="px-3 w-40 h-8"
          data-cy="todoItem-affiliation-doNotAuthorizeButton"
          @click="todosStore.authorize(item.affiliationInvitationDetails.id, false)"
        >
          <span class="w-full text-center"> {{ $t('button.todoItem.doNotAuthorize') }}</span>
        </UButton>
        <UButton
          class="px-3 w-40 h-8"
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

        <div v-if="item.actionButton" :data-cy="'actionButton-' + name">
          <!-- loading button when there is a filing in process -->
          <!-- To-Do the style may need to be adjusted -->
          <UButton
            v-if="inProcessFiling === item.filingId"
            class="px-3 w-40 h-8"
            loading
            disabled
          />
          <UButton
            v-else
            :disabled="item.actionButton.disabled || (item.showAnnualReportCheckbox && !checkboxChecked)"
            class="px-3 w-40 h-8"
            @click="() => item.actionButton.actionFn(item)"
          >
            <span class="w-full text-center">
              {{ $t('text.todoItem.annualReport.actionButton') }}
            </span>
          </UButton>
        </div>
      </div>
    </div>

    <transition name="slide-down">
      <div
        v-if="item.contentPanel && expanded"
        class="px-6 pb-5"
        data-cy="todoItem-content"
      >
        <BcrosTodoContentAffiliation
          v-if="item.contentPanel === ContentPanelE.AffiliationInvitation"
          :for-business-name="business.currentBusiness.legalName"
          :from-org-name="item.affiliationInvitationDetails?.fromOrgName"
          :additional-message="item.affiliationInvitationDetails?.additionalMessage"
        />
        <!-- TO-DO: add more components for content pannels of other todo items -->
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
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
</script>

<style scoped>
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
