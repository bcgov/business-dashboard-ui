<script setup lang="ts">

const { currentBusinessName, isInLimitedRestoration, currentBusiness, stateFiling } = storeToRefs(useBcrosBusiness())
</script>

<template>
  <div>
    <h2
      class="font-bold text-xl"
      data-cy="businessTombstone-header-businessName"
    >
      {{ currentBusinessName }}
    </h2>
    <span
      class="text-sm text"
      data-cy="businessTombstone-header-businessType"
    >
      {{ $t(`label.business.legalTypes.${currentBusiness.legalType}`) }}
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
