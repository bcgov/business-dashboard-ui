<template>
  <BcrosFilingCommonTemplate :filing="filing" data-cy="limited-restoration">
    <template #body>
      <div v-if="isStatusCompleted" class="mt-6">
        <strong>{{ $t('text.filing.restoration.limitedRestorationPeriod') }}</strong>

        <p class="mt-4">
          {{ $t('text.general.the') }}&nbsp;{{ $t('text.general.company') }}&nbsp;
          <strong>{{ currentBusinessName }}</strong>
          {{ $t('text.filing.restoration.wasSuccessfullyRestored') }}
          <strong>
            {{ $t('text.filing.common.until') }}&nbsp;{{ expiryDate }}
            {{ $t('text.filing.at1159PacificTime') }}
          </strong>.
          {{ $t('text.filing.restoration.atTheEndOfLimitedRestorationPeriod') }}:
        </p>

        <BcrosContactInfo :contacts="contacts" />
      </div>
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'
import { FilingStatusE, getContactInfo, isFilingStatus } from '#imports'

const { currentBusinessName } = storeToRefs(useBcrosBusiness())

const t = useNuxtApp().$i18n.t

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const contacts = getContactInfo('registries')

const isStatusCompleted = isFilingStatus(props.filing, FilingStatusE.COMPLETED)
const unknownStr = `[${t('text.general.unknown')}]`

/** The expiry date of the limited restoration filing as a Pacific date. */
const expiry = props.filing.data?.restoration?.expiry
const date = yyyyMmDdToDate(expiry)
const expiryDate = dateToPacificDate(date, true) || unknownStr
</script>
