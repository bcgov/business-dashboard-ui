<script setup lang="ts">
import { FilingTypes, FilingNames } from '@bcrs-shared-components/enums'

const prop = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
const contacts = getContactInfo('registries')
const { currentBusinessName } = storeToRefs(useBcrosBusiness())

const subtitle: Ref<string> = ref()
const filingLabel: Ref<string> = ref()
const filingTitle: Ref<string> = ref()

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
      subtitle.value = 'Future Effective Incorporation Date'
      filingLabel.value = 'incorporation'
      filingTitle.value = FilingNames.INCORPORATION_APPLICATION as string
      break
    case FilingTypes.ALTERATION:
      subtitle.value = 'Future Effective Alteration Date'
      filingLabel.value = 'alteration'
      filingTitle.value = 'Alteration Notice'
      break
    case FilingTypes.DISSOLUTION:
      // check if the filing is a voluntary dissolution
      if (prop.filing.filingSubType === FilingSubTypeE.DISSOLUTION_VOLUNTARY) {
        subtitle.value = 'Future Effective Voluntary Dissolution Date'
        filingLabel.value = 'dissolution'
        filingTitle.value = FilingNames.VOLUNTARY_DISSOLUTION
      }
      break
    case FilingTypes.CONTINUATION_IN:
      subtitle.value = 'Future Effective Continuation Date'
      filingLabel.value = 'filing'
      filingTitle.value = FilingNames.CONTINUATION_IN_APPLICATION
      break
    default:
      subtitle.value = 'Future Effective Filing Date'
      filingLabel.value = 'filing'
      filingTitle.value = 'filing'
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
      If you wish to change the information in this {{ filingLabel }}, you must contact BC
      Registries staff to file a withdrawal. Withdrawing this {{ filingTitle }} will remove
      this {{ filingLabel }} and all associated information, and will incur a $20.00 fee.
    </p>

    <div class="font-bold">
      BC Registries Contact Information:
    </div>

    <BcrosContactInfo :contacts="contacts" />
  </div>
</template>
