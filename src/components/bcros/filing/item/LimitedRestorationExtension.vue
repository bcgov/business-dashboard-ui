<template>
  <BcrosFilingCommonTemplate :filing="filing" data-cy="limited-restoration-extension">
    <template #body>
      <strong>{{ $t('text.filing.restoration.extensionOfLimitedRestoration') }}</strong>

      <p>
        {{ $t('text.filing.restoration.periodWasSuccessfullyExtended') }}&nbsp;
        <strong>{{ $t('text.filing.common.until') }}&nbsp;{{ expiryDate }}</strong>.
        {{ $t('text.filing.restoration.atTheEndOfExtensionLimitedRestorationPeriod') }}:
      </p>

      <BcrosContactInfo :contacts="contacts" />
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'
import { getContactInfo } from '#imports'

const t = useNuxtApp().$i18n.t
const contacts = getContactInfo('registries')

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const unknownStr = `[${t('text.general.unknown')}]`

/** The expiry date of the limited restoration filing as a Pacific date. */
const expiry = props.filing.data?.restoration?.expiry
const date = yyyyMmDdToDate(expiry)
const expiryDate = dateToPacificDate(date, true) || unknownStr

</script>
