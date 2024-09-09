<script setup lang="ts">
import { FilingTypes } from '@bcrs-shared-components/enums'

const prop = defineProps({
  noTasks: { type: Boolean, required: true }
})

const { currentBusiness, businessConfig } = storeToRefs(useBcrosBusiness())
const { filings } = storeToRefs(useBcrosFilings())
const dismissed = ref(false)

const obligations = computed(() => businessConfig.value?.obligations)
const isActive = computed(() => currentBusiness.value?.state === BusinessStateE.ACTIVE)

// whether the business has no filing history except their application
// e.g., only one Amalgamation/IncorporationApplication/Registration/ContinuationIn in filing history
const hasNoMaintenanceFilings = computed(() =>
  filings.value.length === 1 && (
    isFilingType(filings.value[0], FilingTypes.AMALGAMATION_APPLICATION) ||
    isFilingType(filings.value[0], FilingTypes.INCORPORATION_APPLICATION) ||
    isFilingType(filings.value[0], FilingTypes.REGISTRATION) ||
    isFilingType(filings.value[0], FilingTypes.CONTINUATION_IN)
  )
)

// Show the legal obligation box when:
// - the 'Dismiss' button has not been clicked
// - it is an active business (no temp business)
// - it has no tasks in todo section and no maintenance filings in the filing history
const showLegalObligation = computed(() => {
  return !dismissed.value && !!obligations && isActive && prop.noTasks && hasNoMaintenanceFilings.value
})

const readMore = ref(false)
const toggleReadMore = () => {
  readMore.value = !readMore.value
}
</script>

<template>
  <div v-if="showLegalObligation" class="bg-white rounded flex p-5" data-cy="legalObligation">
    <div class="icon-container mt-1 ml-2" role="img" aria-label="information">
      <UIcon class="text-2xl bg-primary" name="i-mdi-information-outline" />
    </div>
    <div class="flex flex-col ml-2 mt-1 gap-3 w-full">
      <span class="break-words" data-cy="legalObligation-statement">
        <strong>{{ obligations?.title }}</strong>
        You are required by the
        <span class="italic">{{ obligations?.act }}</span>
        {{ obligations?.obligationStatement }}
      </span>
      <div v-if="readMore" data-cy="legalObligation-detail">
        <span>{{ $t('text.legalObligations.changesInclude') }}</span>
        <ul class="list-disc pl-5 pt-3">
          <li v-for="(obligation, index) in obligations.includedChanges" :key="index" class="pb-2">
            <strong>{{ $t(obligation.label) }}</strong> - {{ $t(obligation.description) }}
          </li>
        </ul>
        <div class="flex" data-cy="legalObligation-link">
          <a
            :href="obligations.detailInfoURL"
            target="_blank"
            class="text-primary underline"
          >
            {{ $t('text.legalObligations.moreInfo') }}
          </a>
          <UIcon name="i-mdi-open-in-new" class="text-primary text-base mx-1 mt-1.5" />
        </div>
        <div
          class="text-primary underline cursor-pointer py-5"
          data-cy="legalObligation-readLess"
          @click="toggleReadMore()"
        >
          {{ $t('text.legalObligations.readLess') }}
        </div>
      </div>
      <div
        v-else
        class="text-primary underline cursor-pointer"
        data-cy="legalObligation-readMore"
        @click="toggleReadMore()"
      >
        {{ $t('text.legalObligations.readMore') }}
      </div>
      <div class="flex justify-end mr-2">
        <UButton class="px-5 py-1" @click="dismissed = true">
          {{ $t('button.general.dismiss') }}
        </UButton>
      </div>
    </div>
  </div>
</template>
