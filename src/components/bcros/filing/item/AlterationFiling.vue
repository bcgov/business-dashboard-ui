<template>
  <BcrosFilingCommonTemplate :filing="filing" data-cy="alteration-filing">
    <template #subtitle>
      <BcrosFilingCommonFiledAndPendingPaid v-if="isFutureEffectivePending(filing)" :filing="filing" />
      <BcrosFilingCommonFutureEffectivePaid v-else-if="isFutureEffective(filing)" :filing="filing" />
    </template>

    <template #body>
      <BcrosFilingCommonFutureEffectivePending v-if="isFutureEffectivePending(filing)" :filing="filing" />
      <BcrosFilingCommonFutureEffective v-else-if="isFutureEffective(filing)" :filing="filing" />
      <div
        v-else-if="isFilingCompleted"
        data-cy="completed-alteration-details"
      >
        <strong>{{ $t('text.filing.alteration.complete') }}</strong>

        <p v-if="fromLegalType !== toLegalType">
          {{ currentBusinessName || $t('text.filing.alteration.thisCompany') }}
          {{ $t('text.filing.alteration.wasSuccessfullyAltered') }}
          {{ $t('text.filing.alteration.from') }} {{ GetCorpFullDescription(fromLegalType) }}
          {{ $t('text.filing.alteration.to') }} {{ GetCorpFullDescription(toLegalType) }}
          {{ $t('text.filing.alteration.on') }}
          <BcrosFilingCommonDateWithTooltip :date="filing.effectiveDate" />
          .
        </p>

        <p v-if="courtOrderNumber">
          {{ $t('text.filing.common.courtOrderNumber') }}: {{ courtOrderNumber }}
        </p>

        <p v-if="isArrangement">
          {{ $t('text.filing.common.pursuantToAPlanOfArrangement') }}
        </p>
      </div>
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module'
import type { ApiResponseFilingI } from '#imports'
import { FilingStatusE, isFilingStatus } from '#imports'
import { isFutureEffective, isFutureEffectivePending } from '~/utils/filings'

const { currentBusinessName } = storeToRefs(useBcrosBusiness())

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const isFilingCompleted = isFilingStatus(props.filing, FilingStatusE.COMPLETED)
const fromLegalType = props.filing.data?.alteration?.fromLegalType
const toLegalType = props.filing.data?.alteration?.toLegalType
const courtOrderNumber = isFilingCompleted ? props.filing.data?.order?.fileNumber : null
const isArrangement =
  isFilingCompleted && EffectOfOrderTypeE.PLAN_OF_ARRANGEMENT === props.filing.data?.order?.effectOfOrder

</script>
