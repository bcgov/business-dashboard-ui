<template>
  <div :data-cy="`filingHistoryItem-${dataCy}-${filing.filingId}`" class="w-full bg-white p-3 rounded-sm">
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
            <BcrosFilingCommonFiledAndPaid v-else :filing="filing" />
          </slot>
        </div>

        <slot name="detailsButton">
          <UButton
            v-if="filing.commentsCount > 0"
            class="comments-btn mt-1"
            outlined
            color="primary"
            :ripple="false"
            @click.stop="isShowBody = !isShowBody"
          >
            <UIcon name="i-mdi-message-reply" size="small" />
            <span>
              {{ isShowBody ? $t('label.filing.detail') : $t('label.filing.detail') }}
              ({{ filing.commentsCount }})</span>
          </UButton>
        </slot>
      </div>
      <div class="ml-auto order-2">
        <slot name="actions">
          <BcrosFilingCommonHeaderActions v-model:isExpanded="isShowBody" :filing="filing" />
        </slot>
      </div>
    </div>

    <div v-if="isShowBody" data-cy="filingHistoryItem-body">
      <slot name="body">
        <!-- is this a generic paid (not yet completed) filing? -->
        <div v-if="isStatusPaid || isStatusApproved" class="body-2">
          <strong>{{ $t('text.filing.general.filingPending') }}</strong>

          <p>
            {{ $t('text.filing.general.filingPending') }}&nbsp;{{ title }}
            {{ $t('text.filing.general.paidButNotCompletedByRegistry') }}
          </p>

          <BcrosFilingCommonCourtNumber :filing="filing" />
          <BcrosFilingCommonPlanOfArrangement :filing="filing" />

          <p> {{ $t('text.filing.general.refreshScreenOrContact') }} </p>

          <BcrosContactInfo :contacts="contacts" />
        </div>

        <!-- otherwise, this is a completed filing -->
        <div v-else class="body-2">
          <BcrosFilingCommonCourtNumber :filing="filing" />
          <BcrosFilingCommonPlanOfArrangement :filing="filing" />
        </div>
      </slot>

      <slot name="documents">
        <!-- if we have documents, show them -->
        <!-- NB: staff filings don't have documents - see StaffFiling.vue for any exceptions -->
        <template v-if="!isStaffFiling(filing) && filing.documentsLink">
          <UDivider class="my-6" />
          <BcrosFilingCommonDocumentsList :filing="filing" />
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
import type { ApiResponseFilingI } from '#imports'
import { FilingStatusE, isFilingStatus } from '#imports'

const contacts = getContactInfo('registries')
const t = useNuxtApp().$i18n.t

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true },
  dataCy: { type: String, required: true }
})

const isStatusPaid = computed(() => isFilingStatus(props.filing, FilingStatusE.PAID))
const isStatusApproved = computed(() => isFilingStatus(props.filing, FilingStatusE.APPROVED))
const isShowBody = ref(false)

/** The title of this filing. */
const title =
  isFilingType(props.filing, FilingTypes.ALTERATION)
    ? t('filing.name.alteration')
    : props.filing.displayName || t('filing.name.filing')
</script>
