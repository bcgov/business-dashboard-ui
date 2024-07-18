<template>
  <BcrosFilingCommonTemplate
    :filing="filing"
    data-cy="continuation-in"
  >
    <template #subtitle>
      <BcrosFilingCommonFiledAndPendingPaid v-if="isFutureEffectivePending" :filing="filing" />
      <BcrosFilingCommonFutureEffectivePaid v-else-if="isFutureEffective" :filing="filing" />
    </template>

    <template #body>
      <!--      todo: add in next ticket #22331 -->
      TBD
      <!--      <FutureEffectivePending-->
      <!--        v-if="isFutureEffectivePending"-->
      <!--        :filing="filing"-->
      <!--      />-->

      <!--      <FutureEffective-->
      <!--        v-else-if="isFutureEffective"-->
      <!--        :filing="filing"-->
      <!--      />-->

      <!--      <div-->
      <!--        v-else-if="!!tempRegNumber && isStatusCompleted"-->
      <!--        class="completed-continuation-in-details"-->
      <!--      >-->
      <!--        <h4>Incorporation Complete</h4>-->

      <!--        <p>-->
      <!--          {{ companyName }} has been successfully continued in.-->
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

const props = defineProps({
  filing: { type: Object as PropType<ApiResponseFilingI>, required: true }
})

// todo: see to extract this to common method and simplify both methods are checking some simliar stuff
/** Whether this filing is Future Effective Pending (overdue). */
const isFutureEffectivePending = computed((): boolean => {
  return (
    FilingStatusUtils.isStatusPaid(props.filing) &&
    props.filing.isFutureEffective &&
    new Date(props.filing.effectiveDate) < new Date()
  )
})

/** Whether this filing is Future Effective (not yet completed). */
const isFutureEffective = computed((): boolean => {
  return (
    FilingStatusUtils.isStatusPaid(props.filing) &&
    props.filing.isFutureEffective &&
    new Date(props.filing.effectiveDate) > new Date()
  )
})

// /** The Temporary Registration Number string (may be null). */
// get tempRegNumber (): string {
//   return sessionStorage.getItem('TEMP_REG_NUMBER')
// }
//
// /** Whether this filing is in Complete status. */
// get isStatusCompleted (): boolean {
//   return EnumUtilities.isStatusCompleted(this.filing)
// }
// }
//
// /** The legal name or numbered description of the new company. */
// get companyName (): string {
//   if (this.getLegalName) return this.getLegalName
//   if (this.getEntityName) return `A ${this.getEntityName}`
//   return 'Unknown Name'
// }
//
// /** Reloads Filings UI using business id instead of temporary registration number. */
// reloadWithBusinessId (): void {
//   // build the URL to the business dashboard with the business id and any URL parameters
//   const url = this.getDashboardUrl + this.filing.businessIdentifier + this.$route.fullPath
//   window.location.assign(url)
// }
</script>
