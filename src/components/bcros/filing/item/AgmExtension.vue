<template>
  <BcrosFilingCommonTemplate data-cy="agm-extension" :filing="filing">
    <template #body>
      <div v-if="isFilingCompleted">
        <p class="mt-0">
          {{ $t('text.general.the') }}&nbsp;{{ agmYear }}&nbsp;
          {{ $t('text.filing.agm.mustBeHeldBy') }}&nbsp;<strong>{{ agmDueDate }}</strong>.
        </p>
      </div>
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import { type ApiResponseFilingI, dateToPacificDate } from '#imports'
import { FilingStatusE } from '#imports'

const t = useNuxtApp().$i18n.t

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const isFilingCompleted = isFilingStatus(props.filing, FilingStatusE.COMPLETED)

const agmYear = props.filing.data?.agmExtension?.year || `[${t('text.general.unknown').toLowerCase()}]`

const yyyyMmDd = props.filing.data?.agmExtension?.expireDateApprovedExt
const date = yyyyMmDdToDate(yyyyMmDd)
const pacificDate = dateToPacificDate(date, true)

const agmDueDate = pacificDate
  ? `${pacificDate} at 11:59 pm Pacific time`
  : `[${t('text.general.unknown').toLowerCase()}]`
</script>
