<script setup lang="ts">
import { ApiResponseFilingI, AuthorizedActionsE } from '#imports'
const isCommentOpen = ref(false)

const filing = defineModel('filing', { type: Object as PropType<ApiResponseFilingI>, required: true })

const { currentBusiness } = storeToRefs(useBcrosBusiness())
const { isDisableNonBenCorps } = useBcrosBusiness()
const isAuthorizedDetailComments = computed(() =>
  !!currentBusiness.value?.identifier && isAuthorized(AuthorizedActionsE.DETAIL_COMMENTS))

const showCommentDialog = (show: boolean) => {
  isCommentOpen.value = show
}

</script>

<template>
  <div data-cy="details-list">
    <div class="flex flex-row gap-2">
      <div class="mt-auto pb-4">
        <strong>
          <UIcon name="i-mdi-message-text-outline" size="small" />
          <span class="pl-1">
            {{ $t('label.filing.detail') }} ({{ filing.comments?.length || 0 }})</span>
        </strong>
      </div>
      <div class="ml-auto pr-2 order-2">
        <UButton
          v-if="!isDisableNonBenCorps() && isAuthorizedDetailComments"
          class="rounded-sm px-3 py-2"
          :disabled="!filing.filingId"
          @click="showCommentDialog(true)"
        >
          <span>{{ $t('button.filing.actions.addDetail') }}</span>
        </UButton>
        <UModal v-model="isCommentOpen" :ui="{base: 'absolute left-10 top-5 bottom-5'}">
          <BcrosComment :comments="filing.comments" :filing="filing" @close="showCommentDialog(false)" />
        </UModal>
      </div>
    </div>

    <!-- the detail comments list-->
    <div class="flex flex-col gap-5 pb-0 text-sm" data-cy="detail-comments-list">
      <div
        v-for="(comment, index) in filing.comments"
        :key="index"
        class="pl-0 pr-0 detail-body"
      >
        <div class="flex flex-col gap-0.5">
          <div class="body-2">
            <strong v-if="!isAuthorizedDetailComments">BC Registries Staff</strong>
            <strong v-else>{{ comment.submitterDisplayName || 'N/A' }}</strong>
            ({{ apiToPacificDateTime(comment.timestamp) }})
          </div>
          <div class="body-2">
            <div class="whitespace-pre-line break-words">
              {{ comment.comment }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
