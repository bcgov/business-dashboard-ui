<template>
  <BcrosFilingCommonTemplate
    :filing="filing"
    data-cy="paper-filing"
  >
    <template #body>
      <p>
        This filing is available on paper only. To request copies of paper documents,
        contact BC Registries staff:
      </p>

      <BcrosContactInfo :contacts="contacts" />
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import { getContactInfo } from '~/utils/contact-info'
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const contacts = getContactInfo('registries')

</script>
