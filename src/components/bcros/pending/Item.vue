<script setup lang="ts">
import { FilingTypes } from '@bcrs-shared-components/enums'

defineProps({
  item: { type: Object as PropType<PendingItemI>, required: true }
})
const { linkedNr } = storeToRefs(useBcrosBusinessBootstrap())
const contacts = getContactInfo('registries')

const expanded = ref(true)
</script>

<template>
  <div class="flex flex-col gap-0 w-full">
    <div
      class="flex flex-row w-full justify-between px-6 py-5"
      :data-cy="'pendingItem-header-' + item.name"
    >
      <div class="flex flex-col" :data-cy="'pendingItem-label-' + item.name">
        <div class="flex flex-row gap-2">
          <div class="font-bold text-base">
            {{ item.title }}
          </div>
          <UButton
            v-if="item.expandable"
            variant="ghost"
            leading-icon="i-mdi-information-outline"
            class="-mt-1 h-8"
            :data-cy="'pendingItem-showMore-' + item.name"
            :ui="{ icon: {base: 'ml-3'} }"
            @click="expanded = !expanded"
          >
            <span class="mr-3">
              {{ expanded ? $t('button.todoItem.hideDetails') : $t('button.todoItem.showDetails') }}
            </span>
          </UButton>
        </div>
        <div class="flex flex-row gap-2 w-full">
          <span>PENDING STAFF REVIEW</span>
          <UDivider orientation="vertical" :ui="{ border: { base: 'border-gray-500'} }" />
          <div>Submitted by {{ item.submitter }} on <BcrosTooltipDate :date="item.submittedDate" /></div>
        </div>
        <div v-if="linkedNr">
          {{ nrSubtitle(linkedNr) }}
        </div>
      </div>
    </div>

    <transition name="slide-down">
      <div v-if="item.expandable && expanded" class="px-6 pb-5" data-cy="pendingItem-content">
        <!-- content for Continuation In -->
        <template v-if="item.filingType === FilingTypes.CONTINUATION_IN">
          <UDivider class="mb-2" :ui="{ border: { base: 'border-gray-200'} }" />
          <div class="mb-0">
            BC Registries will review your documents and contact you with the results within 5 business days.
          </div>
          <BcrosContactInfo :contacts="contacts" class="mt-5" />
        </template>

        <!-- more templates can be added if there are other pending filing types in the future -->
      </div>
    </transition>
  </div>
</template>

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
