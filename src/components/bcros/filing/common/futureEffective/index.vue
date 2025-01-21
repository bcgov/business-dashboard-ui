<script setup lang="ts">
import { FilingTypes } from '@bcrs-shared-components/enums'

const prop = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
const contacts = getContactInfo('registries')

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
  subtitle.value = 'Future Effective Date'
  switch (prop.filing.name) {
    case FilingTypes.ALTERATION:
      filingLabel.value = 'alteration'
      break
    case FilingTypes.CHANGE_OF_ADDRESS:
      subtitle.value = 'Filed and Pending'
      filingLabel.value = 'address change'
      break
    case FilingTypes.AMALGAMATION_APPLICATION:
      filingLabel.value = 'amalgamation'
      break
    case FilingTypes.DISSOLUTION:
      // check if the filing is a voluntary dissolution
      if (prop.filing.filingSubType === FilingSubTypeE.DISSOLUTION_VOLUNTARY) {
        filingLabel.value = 'dissolution'
      }
      break
    case FilingTypes.CONTINUATION_IN:
      filingLabel.value = 'continuation'
      break
    case FilingTypes.INCORPORATION_APPLICATION:
      filingLabel.value = 'incorporation'
      break
    default:
      filingLabel.value = 'filing'
      break
  }
}, { immediate: true })
</script>

<template>
  <div class="flex flex-col gap-2">
    <UDivider class="mt-4" />
    <div class="font-bold mt-3">
      {{ subtitle }}
    </div>

    <p>
      The {{ filingLabel }} will take on <strong>{{ effectiveDateTime }}</strong>.
    </p>

    <p v-if="courtOrderNumber">
      Court Order Number: {{ courtOrderNumber }}
    </p>

    <p v-if="hasEffectOfOrder">
      Pursuant to a Plan of Arrangement
    </p>

    <p>
      If you no longer wish to file this {{ filingLabel }}, you must submit a
      <a
        :href="useRuntimeConfig().public.noticeOfWithdrawalFormURL"
        target="_blank"
        class="text-primary underline"
      >
        Notice of Withdrawal Form
        <UIcon name="i-mdi-open-in-new" class="text-primary align-middle" />
      </a> and a $20.00 fee to BC Registries. You must provide BC Registries
      with enough time to process the withdrawal before the effective date and time.
      If you withdraw this record, your filing fees will not be refunded.
    </p>

    <div class="font-bold mt-4">
      BC Registries Contact Information
      <p>Monday to Friday, 8:30am - 4:30pm Pacific Time</p>
    </div>

    <BcrosContactInfo :contacts="contacts" />
  </div>
</template>
