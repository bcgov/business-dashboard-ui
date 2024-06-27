<template>
  <header class="flex flex-row gap-1.5 text-sm">
    <template v-if="!!currentBusiness.identifier">
      <div v-if="currentBusiness.state === BusinessStateE.HISTORICAL" class="flex flex-row gap-1.5">
        <BcrosChips :label="$t('label.business.status.historical')" />
        <span>{{ getReasonText }}</span>
      </div>
      <div v-if="currentBusiness.state === BusinessStateE.ACTIVE && isInLimitedRestoration">
        <BcrosChips :label="$t('label.business.status.limitedRestoration')" />
      </div>
      <div v-if="currentBusiness.state === BusinessStateE.ACTIVE && isAuthorizedToContinueOut">
        <BcrosChips :label="$t('label.business.status.authorizedToContinueOut')" />
      </div>
    </template>
<!--    &lt;!&ndash;        todo: add this &ndash;&gt;-->
<!--    todo: this to be done when we have tasks and filings incorporated -->
<!--    see line 131 in EntityHeader.vue in business-filings-ui -->
<!--    <template v-if="!!tempRegNumber">-->
<!--      &lt;!&ndash; Title &ndash;&gt;-->
<!--      <div aria-label="Application Name or Future Entity Name">-->
<!--        {{ getEntityName || 'Unknown Name' }}-->
<!--      </div>-->

<!--      &lt;!&ndash; Subtitle &ndash;&gt;-->
<!--      <div aria-label="Amalgamation, Continuation In, Incorporation or Registration Description">-->
<!--        {{ appDescription }}-->
<!--      </div>-->
<!--    </template>-->
  </header>
</template>

<script setup lang="ts">
import { BusinessStateE } from '~/enums/business-state-e'
import { useBcrosBusiness } from '~/stores/business'
import { CorpTypeCd, FilingTypes } from '@bcrs-shared-components/enums'
import { FilingSubTypeE } from '~/enums/filing-sub-type-e'

// todo: when temp is done
// const tempRegNumber = (): string => {
//   return sessionStorage.getItem('TEMP_REG_NUMBER')
// }

const t = useNuxtApp().$i18n.t
const {
  currentBusiness,
  stateFiling,
  isInLimitedRestoration,
  isAuthorizedToContinueOut
} = storeToRefs(useBcrosBusiness())

const getReasonText = computed(() => {
  const enDash = '–' // ALT + 0150
  if (currentBusiness.value.state !== BusinessStateE.HISTORICAL) {
    return ''
  }

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
    const isFirm = currentBusiness.value.legalType === CorpTypeCd.SOLE_PROP
      || currentBusiness.value.legalType === CorpTypeCd.PARTNERSHIP

    const subType = stateFiling.value.dissolution?.dissolutionType as FilingSubTypeE
    switch (subType) {
      case FilingSubTypeE.DISSOLUTION_ADMINISTRATIVE:
        reason = t(`filing.reason.dissolutionAdministrative`)
        break
      case FilingSubTypeE.DISSOLUTION_INVOLUNTARY:
        reason = t(`filing.reason.dissolutionAdministrative`)
        break
      case FilingSubTypeE.DISSOLUTION_VOLUNTARY:
        reason = isFirm ? t(`filing.reason.dissolutionFirm`) : t(`filing.reason.dissolutionAdministrative`)
    }

    const date = new Date(stateFiling.value.dissolution?.dissolutionDate).toLocaleDateString('en-CA')
    return `${reason} ${enDash} ${date}`
  }

  // reason for continuation out and default 'reason'
  let reason = ''
  const date = new Date(stateFiling.value.dissolution?.dissolutionDate).toLocaleString('en-CA')
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
