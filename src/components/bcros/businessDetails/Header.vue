<script setup lang="ts">
const { currentBusinessName, isInLimitedRestoration, currentBusiness, stateFiling } = storeToRefs(useBcrosBusiness())
const { bootstrapName, bootstrapFilingDisplayName } = storeToRefs(useBcrosBusinessBootstrap())
const t = useNuxtApp().$i18n.t

const name = computed(() => currentBusinessName.value ?? bootstrapName.value)
const legalType = computed(() => {
  if (currentBusiness.value?.legalType) {
    return t(`label.business.legalTypes.${currentBusiness.value.legalType}`)
  }
  return bootstrapFilingDisplayName.value
})

const limitedRestorationActiveUntilDate = computed(() => {
  const date = yyyyMmDdToDate(stateFiling.value?.restoration?.expiry)
  return dateToPacificDate(date, true)
})
</script>

<template>
  <div>
    <h2
      class="font-bold text-xl"
      data-cy="businessTombstone-header-businessName"
    >
      {{ name }}
    </h2>
    <span
      class="text-sm"
      data-cy="businessTombstone-header-businessType"
    >
      {{ legalType }}
    </span>
    <BcrosDivider class="mx-2 text-xs text-gray-300" />
    <span
      v-if="isInLimitedRestoration"
      data-cy="businessTombstone-header-activeUntil"
      class="text-sm"
    >
      {{ $t('label.business.activeUntil') }}
      {{ limitedRestorationActiveUntilDate || $t(`label.business.activeUntilUnknown`) }}
    </span>
  </div>
</template>
