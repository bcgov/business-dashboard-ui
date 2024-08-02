<template>
  <div data-cy="details-list">
    <div class="flex flex-row gap-2">
      <div class="mt-auto pb-4">
        <strong>
          <UIcon name="i-mdi-message-reply" class="my-auto" />
          <span class="pl-1">
            {{ $t('label.filing.detail') }} ({{ filing.comments.length }})</span>
        </strong>
      </div>
      <div class="ml-auto pr-2 order-2">
        <UButton
          v-if="!isDisableNonBenCorps() && hasRoleStaff"
          class="rounded-sm px-3 py-2"
          :disabled="!filing.filingId"
          @click="showCommentDialog()"
        >
          <span>{{ $t('button.filing.actions.addDetail') }}</span>
        </UButton>
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
            <strong v-if="!hasRoleStaff">BC Registries Staff</strong>
            <strong v-else>{{ comment.submitterDisplayName || 'N/A' }}</strong>
            ({{ apiToPacificDateTime(comment.timestamp) }})
          </div>
          <div class="body-2">
            <div class="pre-line">
              {{ comment.comment }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '#imports'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

const { isDisableNonBenCorps } = useBcrosBusiness()

const { hasRoleStaff } = storeToRefs(useBcrosKeycloak())

const showCommentDialog = () => {
  // todo: add with 21305
}

</script>
