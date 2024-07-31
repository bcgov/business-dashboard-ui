<template>
  <div class="details-list">
    <div class="title-bar">
      <h4>
        <v-icon small>
          mdi-message-reply
        </v-icon>
        <span class="ml-1">Detail{{ filing.comments.length > 1 ? "s" : "" }} ({{ filing.comments.length }})</span>
      </h4>
      <UButton
        v-if="!isDisableNonBenCorps && isRoleStaff"
        color="primary"
        :disabled="!filing.filingId"
        @click="showCommentDialog()"
      >
        <span>Add Detail</span>
      </UButton>
    </div>

    <!-- the detail comments list-->
    <div class="flex flex-col gap-3 pb-0" data-cy="detail-comments-list">
      <div
        v-for="(comment, index) in filing.comments"
        :key="index"
        class="pl-0 pr-0 detail-body"
      >
        <div class="flex flex-col gap-0.5">
          <div class="body-2">
            <strong v-if="!isRoleStaff">BC Registries Staff</strong>
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

const {  isDisableNonBenCorps } = useBcrosBusiness()

const { isRoleStaff } = storeToRefs(useBcrosKeycloak())

const showCommentDialog = () => {
  //todo: add after #21352 & #21305
}

</script>
