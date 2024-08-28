<script setup lang="ts">
import { CorpTypeCd, FilingTypes } from '@bcrs-shared-components/enums'

const t = useNuxtApp().$i18n.t
const {
  currentBusiness,
  currentBusinessIdentifier,
  stateFiling,
  isInLimitedRestoration,
  isAuthorizedToContinueOut
} = storeToRefs(useBcrosBusiness())

const getReasonText = computed(() => {
  if (currentBusiness.value.state !== BusinessStateE.HISTORICAL) {
    return ''
  }
  const enDash = '–' // ALT + 0150
  // reason for amalgamation
  if (currentBusiness.value.amalgamatedInto) {
    const name = t('filing.name.amalgamation')
    const date = new Date(currentBusiness.value.amalgamatedInto.amalgamationDate)
    const identifier = currentBusiness.value.amalgamatedInto.identifier || t('label.general.unknownCompany')
    return `${name} ${enDash} ${date} ${enDash} ${identifier}`
  }

  const filingType = stateFiling.value?.header?.name
  if (!filingType) {
    return ''
  }

  // reason for dissolution
  if (filingType === FilingTypes.DISSOLUTION) {
    let reason = t('filing.name.unknown')
    const isFirm = currentBusiness.value.legalType === CorpTypeCd.SOLE_PROP ||
      currentBusiness.value.legalType === CorpTypeCd.PARTNERSHIP

    const subType = stateFiling.value?.dissolution?.dissolutionType as FilingSubTypeE
    switch (subType) {
      case FilingSubTypeE.DISSOLUTION_ADMINISTRATIVE:
        reason = t('filing.reason.dissolutionAdministrative')
        break
      case FilingSubTypeE.DISSOLUTION_INVOLUNTARY:
        reason = t('filing.reason.dissolutionAdministrative')
        break
      case FilingSubTypeE.DISSOLUTION_VOLUNTARY:
        reason = isFirm ? t('filing.reason.dissolutionFirm') : t('filing.reason.dissolutionAdministrative')
    }

    const date = dateToPacificDate(new Date(stateFiling.value?.dissolution?.dissolutionDate), true)
    return `${reason} ${enDash} ${date}`
  }

  // reason for continuation out and default 'reason'
  let reason = ''
  const effectiveDate = apiToDate(stateFiling.value?.header?.effectiveDate)
  if (!effectiveDate) {
    throw new Error('Invalid effective date')
  }
  const date = dateToPacificDateTime(effectiveDate)
  if (filingType === FilingTypes.CONTINUATION_OUT) {
    reason = t('filing.reason.continuationOut')
  } else {
    reason = t(`filing.name.${filingType}`)
    if (reason === `filing.name.${filingType}`) {
      reason = t('filing.name.unknown`)')
    }
  }
  return `${reason} ${enDash} ${date}`
})

</script>

<template>
  <div class="flex flex-row gap-1.5 text-sm">
    <template v-if="!!currentBusinessIdentifier">
      <div v-if="currentBusiness.state === BusinessStateE.HISTORICAL" class="flex flex-row gap-1.5">
        <BcrosChips :label="$t('label.business.status.historical')" data-cy="badge.historical" />
        <span>{{ getReasonText }}</span>
      </div>
      <div v-if="currentBusiness.state === BusinessStateE.ACTIVE && isInLimitedRestoration">
        <BcrosChips :label="$t('label.business.status.limitedRestoration')" data-cy="badge.limitedRestoration" />
      </div>
      <div v-if="currentBusiness.state === BusinessStateE.ACTIVE && isAuthorizedToContinueOut">
        <BcrosChips
          :label="$t('label.business.status.authorizedToContinueOut')"
          data-cy="badge.authorizedToContinueOut"
        />
      </div>
    </template>
  </div>
</template>
