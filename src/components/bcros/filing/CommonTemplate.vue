<template>
  <div :data-cy="`filingHistoryItem-${dataCy}`">
    <div data-cy="filingHistoryItem-header">
      <h3 class="item-header-title">
        <slot name="title">
          <!-- todo: should we internationalize this, using lang file ??? -->
          <span>{{ filing.displayName }}</span>
        </slot>
      </h3>
      <slot name="subtitle">
        <BcrosFilingCommonFiledAndPendingPaid
          v-if="isStatusPaid"
          :filing="filing"
        />
        <BcrosFilingCommonFiledAndPaid
          v-else
          :filing="filing"
        />
      </slot>

      <slot name="details-button">
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
    <div v-if="isShowBody" data-cy="filingHistoryItem-body">
      <slot name="body">
        todo: ticket #
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true },
  dataCy: { type: String, required: true }
})

const isStatusPaid = computed(() => FilingStatusUtils.isStatusPaid(props.filing))
const isShowBody = ref(false)
</script>
