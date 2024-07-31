<template>
  <BcrosFilingCommonTemplate :filing="filing" data-cy="paper-filing">
    <template #body>
      <p>{{ $t('text.filing.paperFilingBody') }}:</p>

      <BcrosContactInfo :contacts="contacts" />
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'
import { getContactInfo } from '#imports'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const contacts = getContactInfo('registries')
</script>
