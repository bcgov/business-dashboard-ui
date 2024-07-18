<template>
  <div class="w-full divide-x">
    <span v-if="isTypeIncorporationApplication">{{ $t('text.filing.futureEffectiveIncorporation') }}</span>
    <span v-else-if="isTypeAlteration">{{ $t('text.filing.futureEffectiveAlteration') }}</span>
    <span v-else-if="isTypeDissolutionVoluntary">{{ $t('text.filing.futureEffectiveDissolution') }}</span>
    <span v-else>{{ $t('text.filing.futureEffectiveFiling') }}</span>
    <span>
      {{ $t('text.filing.paid') }}
      <BcrosFilingCommonFiledLabel :filing="filing" />
    </span>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
/** Whether this is an incorporation application. */
const isTypeIncorporationApplication = computed(() => FilingUtils.isTypeIncorporationApplication(props.filing))

/** Whether this is an alteration. */
const isTypeAlteration = computed(() => FilingUtils.isTypeAlteration(props.filing))

/** Whether this is a voluntary dissolution. */
const isTypeDissolutionVoluntary = computed(() => FilingUtils.isTypeDissolutionVoluntary(props.filing))
</script>
