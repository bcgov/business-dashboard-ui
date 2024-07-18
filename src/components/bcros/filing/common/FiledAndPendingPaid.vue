<template>
  <div class="filed-and-pending-paid">
    <span class="orange--text text--darken-2">
      {{ $t('text.filing.filedAndPending') }}
    </span>
    <span class="vert-pipe" />
    <span>
      {{ $t('text.filing.paid') }}
      <BcrosFilingCommonFiledLabel :filing="filing" />
    </span>

    <!--    <v-btn-->
    <!--      class="details-btn"-->
    <!--      :class="{ 'bootstrap-filing': isBootstrapFiling }"-->
    <!--      outlined-->
    <!--      color="orange darken-2"-->
    <!--      :ripple="false"-->
    <!--      @click.stop="toggleFilingHistoryItem(index)"-->
    <!--    >-->
    <!--      <v-icon>mdi-alert</v-icon>-->
    <!--      <span class="view-details ml-1">View Details</span>-->
    <!--      <span class="hide-details ml-1">Hide Details</span>-->
    <!--    </v-btn>-->
  </div>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})
</script>
