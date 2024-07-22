<template>
  <div class="flex flex-row gap-2 w-full">
    <span v-if="isTypeIncorporationApplication">{{ $t('text.filing.futureEffectiveIncorporation') }}</span>
    <span v-else-if="isTypeAlteration">{{ $t('text.filing.futureEffectiveAlteration') }}</span>
    <span v-else-if="isTypeDissolutionVoluntary">{{ $t('text.filing.futureEffectiveDissolution') }}</span>
    <span v-else>{{ $t('text.filing.futureEffectiveFiling') }}</span>

    <span>
      {{ $t('text.filing.paid') }} <BcrosFilingCommonFiledLabel :filing="filing" />
    </span>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'
import { FilingTypes } from '@bcrs-shared-components/enums'

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
/** Whether this is an incorporation application. */
const isTypeIncorporationApplication = computed(() => isFilingType(props.filing, FilingTypes.INCORPORATION_APPLICATION))

/** Whether this is an alteration. */
const isTypeAlteration = computed(() => isFilingType(props.filing, FilingTypes.ALTERATION))

/** Whether this is a voluntary dissolution. */
const isTypeDissolutionVoluntary = computed(() =>
  isFilingType(props.filing, undefined, FilingSubTypeE.DISSOLUTION_VOLUNTARY))
</script>
