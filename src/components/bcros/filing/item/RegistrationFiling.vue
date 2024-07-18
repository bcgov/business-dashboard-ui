<template>
  <BcrosFilingCommonTemplate
    :filing="filing"
    data-cy="registration-filing"
  >
    <template #body>
      <!--      todo: add in next ticket #22331 -->
      <!--      <div-->
      <!--        v-if="!!tempRegNumber && isStatusCompleted"-->
      <!--        class="completed-registration-details"-->
      <!--      >-->
      <!--        <h4>Registration Complete</h4>-->

      <!--        <p>-->
      <!--          {{ getLegalName || 'This company' }} has been successfully registered.-->
      <!--        </p>-->

      <!--        <p>-->
      <!--          The system has completed processing your filing. You can now retrieve the business information.-->
      <!--        </p>-->

      <!--        <div class="reload-business-container text-center mt-6">-->
      <!--          <v-btn-->
      <!--            color="primary"-->
      <!--            @click.stop="reloadWithBusinessId()"-->
      <!--          >-->
      <!--            <span>Retrieve Business Information</span>-->
      <!--          </v-btn>-->
      <!--        </div>-->
      <!--      </div>-->
    </template>
  </BcrosFilingCommonTemplate>
</template>

<script setup lang="ts">
import type { ApiResponseFilingI } from '~/interfaces/filing-i'

defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

// /** The Temporary Registration Number string (may be null). */
// get tempRegNumber (): string {
//   return sessionStorage.getItem('TEMP_REG_NUMBER')
// }

// const isStatusCompleted = computed(() => UtilsFilingStatus.isStatusCompleted(props.filing))

/** Reloads Filings UI using business id instead of temporary registration number. */
// reloadWithBusinessId (): void {
//   // build the URL to the business dashboard with the business id and any URL parameters
//   const url = this.getDashboardUrl + this.filing.businessIdentifier + this.$route.fullPath
//   window.location.assign(url)
// }

</script>
