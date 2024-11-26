<template>
  <div>
    <span v-if="isTypeIncorporationApplication">{{ $t('text.filing.futureEffectiveIncorporation') }}</span>
    <span v-else-if="isTypeContinuationApplication">{{ $t('text.filing.futureEffectiveContinuation') }}</span>
    <span v-else-if="isTypeAlteration">{{ $t('text.filing.futureEffectiveAlteration') }}</span>
    <span v-else-if="isTypeDissolutionVoluntary">{{ $t('text.filing.futureEffectiveDissolution') }}</span>
    <span v-else>{{ $t('text.filing.futureEffectiveFiling') }}</span>
    <span>
      {{ $t('text.filing.paid') }}
    </span>
    <BcrosDivider class="mx-2" />
    <BcrosFilingCommonFiledLabel :filing="filing" />
  </div>
</template>

<script setup lang="ts">
import { FilingTypes } from '@bcrs-shared-components/enums'
import type { ApiResponseFilingI } from '#imports'

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

/** Whether this is an incorporation application. */
const isTypeIncorporationApplication = computed(() => isFilingType(props.filing, FilingTypes.INCORPORATION_APPLICATION))

/** Whether this is an continuation application. */
const isTypeContinuationApplication = computed(() => isFilingType(props.filing, FilingTypes.CONTINUATION_IN))

/** Whether this is an alteration. */
const isTypeAlteration = computed(() => isFilingType(props.filing, FilingTypes.ALTERATION))

/** Whether this is a voluntary dissolution. */
const isTypeDissolutionVoluntary = computed(() =>
  isFilingType(props.filing, undefined, FilingSubTypeE.DISSOLUTION_VOLUNTARY))
</script>
