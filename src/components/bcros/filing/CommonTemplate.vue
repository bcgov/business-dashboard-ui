<template>
  <div :data-cy="`filingHistoryItem-${dataCy}-${filing.filingId}`" class="w-full bg-white px-6 py-3 rounded-sm">
    <div data-cy="filingHistoryItem-header" class="flex flex-row gap-2 items-center">
      <div class="flex flex-col">
        <strong class="item-header-title">
          <slot name="title">
            <!-- todo: should we internationalize this, using lang file ??? -->
            <span>{{ filing.displayName }}</span>
          </slot>
        </strong>
        <div class="text-sm">
          <slot name="subtitle">
            <!-- fixme: naming is bit confusing, as status paid leads to PAID AND PENDING message on the UI  -->
            <BcrosFilingCommonFiledAndPendingPaid v-if="isStatusPaid" :filing="filing" />
            <BcrosFilingCommonFiledAndWithdrawn v-else-if="isStatusWithdrawn" :filing="filing" />
            <BcrosFilingCommonFiledAndPaid v-else :filing="filing" />
          </slot>
        </div>

        <slot name="detailsButton">
          <div>
            <UButton
              v-if="filing.commentsCount > 0"
              class="px-3 py-2"
              variant="ghost"
              @click.stop="showDetails()"
            >
              <UIcon name="i-mdi-message-text-outline" size="small" />
              <span>
                {{ isShowBody ? $t('label.filing.detail') : $t('label.filing.detail') }}
                ({{ filing.commentsCount }})</span>
            </UButton>
          </div>
        </slot>
      </div>
      <div class="ml-auto order-2">
        <slot name="actions">
          <BcrosFilingCommonHeaderActions
            v-model:is-expanded="isShowBody"
            v-model:filing="filing"
          />
        </slot>
      </div>
    </div>
    <div v-if="isShowBody" data-cy="filingHistoryItem-body">
      <slot name="body">
        <!-- is this a generic paid (not yet completed) filing? -->
        <div v-if="isStatusPaid || isStatusApproved" class="mt-2 flex flex-col gap-2">
          <template v-if="isChangeOfOfficersType(filing)">
            <UDivider class="my-2" />
            <p>
              {{ $t('text.filing.common.paidButNotCompletedByRegistry') }}<br />
              {{ $t('text.filing.common.paidButNotCompletedByRegistry1') }}
            </p>
          </template>
          <template v-else>
            <strong>{{ $t('text.filing.general.filingPending') }}</strong>

            <p>
              {{ $t('text.filing.general.paidButNotCompletedByRegistry').replace('FILING', title) }}
            </p>

            <BcrosFilingCommonCourtNumber :filing="filing" />
            <BcrosFilingCommonPlanOfArrangement :filing="filing" />

            <p> {{ $t('text.filing.general.refreshScreenOrContact') }} </p>
          </template>
          <BcrosContactInfo :contacts="contacts" />
        </div>

        <!-- otherwise, this is a completed filing -->
        <div v-else class="mt-2 flex flex-col gap-2">
          <BcrosFilingCommonCourtNumber :filing="filing" />
          <BcrosFilingCommonPlanOfArrangement :filing="filing" />
        </div>
      </slot>

      <slot name="documents">
        <!-- if we have documents, show them -->
        <!-- NB: staff filings don't have documents - see StaffFiling.vue for any exceptions -->
        <template v-if="!isStaffFiling(filing) && !isCourtOrderType(filing) && filing.documentsLink">
          <UDivider class="my-6" />
          <BcrosFilingCommonDocumentsList
            :filing="filing"
          />
        </template>
      </slot>

      <slot name="document-record">
        <!-- if we have document records(aka filings staff completed on behalf of a client), show them -->
        <template v-if="!!getDocumentId">
          <UDivider class="my-4" />
          <BcrosDocumentRecordBtn :document-id="getDocumentId" />
        </template>
      </slot>

      <slot name="detail-comments">
        <!-- if we have detail comments, show them -->
        <div v-if="filing.comments && filing.commentsCount > 0" class="mb-n2">
          <UDivider class="my-6" />
          <BcrosFilingCommonDetailsList :filing="filing" />
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FilingTypes } from '@bcrs-shared-components/enums'
import { type ApiResponseFilingI, useBcrosDocuments } from '#imports'
import { FilingStatusE, isFilingStatus } from '#imports'
import { loadComments } from '~/utils/filings'

const ui = useBcrosDashboardUi()
const contacts = getContactInfo('registries')
const t = useNuxtApp().$i18n.t
const { getDocIdByFilingId } = useBcrosDocuments()
const { documents } = storeToRefs(useBcrosDocuments())

const filing = defineModel('filing', { type: Object as PropType<ApiResponseFilingI>, required: true })
defineProps({
  dataCy: { type: String, required: true },
  downloading: { type: Boolean, required: true }
})

if (filing.value.commentsCount && filing.value.commentsLink) {
  filing.value.comments = await loadComments(filing.value)
}

const isStatusPaid = computed(() => isFilingStatus(filing.value, FilingStatusE.PAID))
const isStatusApproved = computed(() => isFilingStatus(filing.value, FilingStatusE.APPROVED))
const isStatusWithdrawn = computed(() => isFilingStatus(filing.value, FilingStatusE.WITHDRAWN))
const getDocumentId = computed(() => getDocIdByFilingId(documents.value, filing.value.filingId))

const isShowBody = ref(false)

const showDetails = async () => {
  if (filing.value.documents === undefined && filing.value.documentsLink) {
    ui.fetchingData = true

    await loadDocumentList(filing.value).catch((error) => {
      console.error('Failed to load the document list.', error)
    })

    // make the spinner display for another 250ms so it does not flash when the promise resolves quickly
    await sleep(250)

    ui.fetchingData = false
  }
  isShowBody.value = !isShowBody.value
}

// auto expand item if expandedFilingId is in URL & item is not expanded
const url = useRequestURL()
const expandedFilingId = url.searchParams.get('filing_id')
if (!isShowBody.value && expandedFilingId && expandedFilingId === filing?.value?.filingId?.toString()) {
  showDetails()
}

/** The title of this filing. */
const title =
  isFilingType(filing.value, FilingTypes.ALTERATION)
    ? t('filing.name.alteration')
    : filing.value.displayName || t('filing.name.filing')
</script>
