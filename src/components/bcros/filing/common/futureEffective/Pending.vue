<script setup lang="ts">
import { FilingTypes } from '@bcrs-shared-components/enums'

const prop = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
const contacts = getContactInfo('registries')
const { currentBusinessName } = storeToRefs(useBcrosBusiness())

const subtitle: Ref<string> = ref()
const filingLabel: Ref<string> = ref()

const courtOrderNumber = computed(() =>
  prop.filing.data?.order?.fileNumber
)

const hasEffectOfOrder = computed(() =>
  !!prop.filing.data?.order?.effectOfOrder
)

const effectiveDateTime = computed(() =>
  prop.filing.effectiveDate ? dateToPacificDateTime(new Date(prop.filing.effectiveDate)) : '[unknown]'
)

watch(prop.filing, () => {
  switch (prop.filing.name) {
    case FilingTypes.INCORPORATION_APPLICATION:
      subtitle.value = 'Incorporation Pending'
      filingLabel.value = 'incorporation'
      break
    case FilingTypes.ALTERATION:
      subtitle.value = 'Alteration Pending'
      filingLabel.value = 'alteration'
      break
    case FilingTypes.DISSOLUTION:
      // check if the filing is a voluntary dissolution
      if (prop.filing.filingSubType === FilingSubTypeE.DISSOLUTION_VOLUNTARY) {
        subtitle.value = 'Voluntary Dissolution Pending'
        filingLabel.value = 'dissolution'
      }
      break
    case FilingTypes.CONTINUATION_IN:
      subtitle.value = 'Continuation Pending'
      filingLabel.value = 'filing'
      break
    default:
      subtitle.value = 'Filing Pending'
      filingLabel.value = 'filing'
      break
  }
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col gap-3 mt-3">
    <div class="font-bold">
      {{ subtitle }}
    </div>

    <p>
      The {{ filingLabel }} date and time for {{ currentBusinessName || 'this company' }}
      will be <strong>{{ effectiveDateTime }}</strong>.
    </p>

    <p v-if="courtOrderNumber">
      Court Order Number: {{ courtOrderNumber }}
    </p>

    <p v-if="hasEffectOfOrder">
      Pursuant to a Plan of Arrangement
    </p>

    <p>
      It may take up to one hour to process this filing. If this issue persists,
      please contact us.
    </p>

    <BcrosContactInfo :contacts="contacts" />
  </div>
</template>
