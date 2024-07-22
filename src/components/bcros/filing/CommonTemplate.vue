<template>
  <div :data-cy="`filingHistoryItem-${dataCy}`" class="w-full bg-white p-3 rounded-sm">
    <div data-cy="filingHistoryItem-header" class="flex flex-col">
      <h3 class="item-header-title">
        <slot name="title">
          <!-- todo: should we internationalize this, using lang file ??? -->
          <span>{{ filing.displayName }}</span>
        </slot>
      </h3>
      <slot name="subtitle">
        <BcrosFilingCommonFiledAndPendingPaid v-if="isStatusPaid" :filing="filing" />
        <BcrosFilingCommonFiledAndPaid v-else :filing="filing" />
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
        <!--      todo: add in next ticket #22331 -->
        to be enabled in the ticket.
        use the slots to verify if anything is passed to the body, and if it is, display it.
      </slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'
import { FilingStatusE, isFilingStatus } from '#imports'

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true },
  dataCy: { type: String, required: true }
})

const isStatusPaid = computed(() => isFilingStatus(props.filing, FilingStatusE.PAID))
const isShowBody = ref(false)
</script>
