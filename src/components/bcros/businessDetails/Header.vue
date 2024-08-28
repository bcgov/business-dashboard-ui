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
      class="text-sm text"
      data-cy="businessTombstone-header-businessType"
    >
      {{ legalType }}
    </span>
    &nbsp;
    <span
      v-if="isInLimitedRestoration"
      data-cy="businessTombstone-header-activeUntil"
      class="bl-2 border-gray-500"
    >
      {{ $t('label.business.activeUntil') }}
      {{ stateFiling?.restoration?.expiry || $t(`label.business.activeUntilUnknown`) }}
    </span>
  </div>
</template>
