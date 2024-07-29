<template>
  <div class="reload-business-container text-center mt-6">
    <UButton
      color="primary"
      @click.stop="reloadWithBusinessId(filing)"
    >
      <span>{{ $t('button.filing.common.retrieveBusinessInformation') }}</span>
    </UButton>
  </div>
</template>

<script setup lang="ts">
import { type ApiResponseFilingI, reloadWithBusinessId } from '#imports'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
</script>
