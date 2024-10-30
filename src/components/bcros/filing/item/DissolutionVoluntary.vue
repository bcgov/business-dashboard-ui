<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'
import { FilingStatusE, isFilingStatus } from '#imports'

const { isEntityFirm } = useBcrosBusiness()
const { currentBusinessName, businessConfig } = storeToRefs(useBcrosBusiness())

const t = useNuxtApp().$i18n.t

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const isStatusCompleted = isFilingStatus(props.filing, FilingStatusE.COMPLETED)

const unknownStr = `[${t('text.general.unknown')}]`

const entityTitle = computed(() => businessConfig.value?.dissolutionConfirmation?.entityTitle || unknownStr)
const actTitle = computed(() => businessConfig.value?.dissolutionConfirmation?.act || unknownStr)

/** The dissolution date-time submitted to display. */
const dissolutionDateSubmittedPacific =
  props.filing.submittedDate ? dateToPacificDateTime(new Date(props.filing.submittedDate)) : unknownStr

/** The dissolution date to display. */
const dissolutionDateIso = props.filing.data?.dissolution?.dissolutionDate
const date = yyyyMmDdToDate(dissolutionDateIso)
const dissolutionDatePacific = dateToPacificDate(date, true) || unknownStr

/** The dissolution date-time to display. */
const dissolutionDateTime =
  props.filing.effectiveDate ? dateToPacificDateTime(new Date(props.filing.effectiveDate)) : unknownStr
</script>

<template>
  <BcrosFilingCommonTemplate :filing="filing" data-cy="dissolution-voluntary">
    <template #subtitle>
      <div class="mt-0.5 mb-3">
        <BcrosFilingCommonFiledAndPendingPaid v-if="isFutureEffectivePending(filing)" :filing="filing" />
        <BcrosFilingCommonFutureEffectivePaid v-else-if="isFutureEffective(filing)" :filing="filing" />
        <BcrosFilingCommonFiledAndPaid v-else :filing="filing" />
      </div>
    </template>

    <template #body>
      <BcrosFilingCommonFutureEffectivePending v-if="isFutureEffectivePending(filing)" :filing="filing" />
      <BcrosFilingCommonFutureEffective v-else-if="isFutureEffective(filing)" :filing="filing" />

      <div v-else-if="isStatusCompleted" data-cy="completed-dissolution-details">
        <strong>{{ $t('text.filing.dissolution.completed') }}</strong>

        <!-- <p v-if="isEntityFirm" class="mt-3">
          {{ $t('text.filing.dissolution.theStatementOf') }} {{ entityTitle }} {{ currentBusinessName || '' }}
          {{ $t('text.filing.dissolution.wasSuccessfully') }}&nbsp;{{ $t('text.filing.dissolution.submittedOn') }}&nbsp;
          <strong>{{ dissolutionDateSubmittedPacific }}</strong>
          {{ $t('text.filing.dissolution.withDissolutionDateOf') }}&nbsp;<strong>{{ dissolutionDatePacific }}</strong>.
          {{ $t('text.general.the') }}&nbsp;{{ entityTitle }} {{
            $t('text.filing.dissolution.hasBeenStruckAndDissolved')
          }},
          {{ $t('text.filing.dissolution.ceasedToBe') }}
          {{ $t('text.filing.dissolution.aRegistered') }}&nbsp;{{ entityTitle }}
          {{ $t('text.filing.dissolution.underThe') }}&nbsp;{{ actTitle }} Act.
        </p> -->

        <!-- <p v-else class="mt-3"> -->
        <p class="mt-3">
          {{ $t('text.general.the') }}&nbsp;{{ entityTitle }} {{ currentBusinessName || '' }}
          {{ $t('text.filing.dissolution.wasSuccessfully') }}&nbsp;
          <strong>{{ $t('text.filing.dissolution.dissolvedOn') }}&nbsp;{{ dissolutionDateTime }}</strong>.
          {{ $t('text.general.the') }}&nbsp;{{ entityTitle }}
          {{ $t('text.filing.dissolution.hasBeenStruckAndDissolved') }},
          {{ $t('text.filing.dissolution.ceasedToBe') }}
          {{ $t('text.filing.dissolution.anIncorporated') }}&nbsp;{{ entityTitle.toLowerCase() }}
          {{ $t('text.filing.dissolution.underThe') }}&nbsp;{{ actTitle }} Act.
        </p>

        <p class="font-bold mt-3">
          {{ $t('text.filing.dissolution.requiredToRetain') }}
        </p>

        <BcrosFilingCommonCourtNumber :filing="filing" />
        <BcrosFilingCommonPlanOfArrangement :filing="filing" />
      </div>
    </template>
  </BcrosFilingCommonTemplate>
</template>
