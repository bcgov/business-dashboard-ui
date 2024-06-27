<template>
  <div class="mt-8 mb-16 flex flex-wrap" data-cy="business-dashboard">
    <div class="w-full md:w-9/12" v-if="alerts && alerts.length>0">
      <BcrosSection name="alerts">
        <template #header>
          {{ $t('title.section.alert') }}({{alerts.length}})
        </template>
        <BcrosAlerts :alerts="alerts" :contact="true" />
      </BcrosSection>
    </div>
    <div class="w-full md:w-9/12">
      <BcrosSection name="todo">
        <template #header>
          {{ $t('title.section.toDo') }}
        </template>
        TBD
      </BcrosSection>
      <BcrosSection name="filingHistory" class="pt-5">
        <template #header>
          {{ $t('title.section.filingHistory') }}
        </template>
        TBD
      </BcrosSection>
    </div>
    <div class="w-full pt-5 md:w-3/12 md:pl-5 md:pt-0 flex flex-col">
      <BcrosSection name="address">
        <template #header>
          {{ $t('title.section.officeAddresses') }}
        </template>
        TBD
      </BcrosSection>
      <BcrosSection name="directors" class="pt-5">
        <template #header>
          {{ $t('title.section.currentDirectors') }}
        </template>
        TBD
      </BcrosSection>
    </div>
  </div>
</template>

<script setup lang="ts">
const business = useBcrosBusiness()
const { currentBusiness } = storeToRefs(business)


const alerts = computed((): Array<Partial<AlertI>> => {
  const initialWarnings = currentBusiness.value?.warnings || [];
  const allWarnings = initialWarnings.concat(currentBusiness.value?.complianceWarnings || []);
  let alertList: Array<Partial<AlertI>> = [];
  if (currentBusiness.value?.adminFreeze) {
    alertList.push({ alertType: AlertTypesE.FROZEN });
  }
  if ( (currentBusiness.value?.goodStanding === false) || (allWarnings.some(item => item.warningType === WarningTypes.NOT_IN_GOOD_STANDING)) ) {
    alertList.push({ alertType: AlertTypesE.STANDING });
  }
  if ( (allWarnings.some(item => item.warningType === WarningTypes.INVOLUNTARY_DISSOLUTION)) || (currentBusiness.value?.inDissolution) ){
    let days = null;
    const warning = allWarnings.find(item =>
      item.warningType?.includes(WarningTypes.INVOLUNTARY_DISSOLUTION)
    )
    const targetDissolutionDate = warning?.data?.targetDissolutionDate
    const daysDifference = daysBetweenTwoDates(
      new Date(), new Date(targetDissolutionDate)
    )

    if (daysDifference) {
      days = daysDifference
    }
    alertList.push({ alertType: AlertTypesE.DISSOLUTION, date: days });
  }

  if (allWarnings.some(item => item.warningType === WarningTypes.COMPLIANCE)){
    alertList.push({ alertType: AlertTypesE.COMPLIANCE });
  }

  if (currentBusiness.value?.state !== "ACTIVE") {
    alertList.push({ alertType: AlertTypesE.DISABLED });
  }

  if (allWarnings.some(item => item.warningType === WarningTypes.FUTURE_EFFECTIVE_AMALGAMATION)){
    const warning = allWarnings.find(item =>
      item.warningType?.includes(WarningTypes.FUTURE_EFFECTIVE_AMALGAMATION)
    )
    const amalDate = warning?.data?.amalgamationDate as string
    alertList.push({ alertType: AlertTypesE.AMALGAMATION, date: amalDate });
  }

  if (allWarnings.some(item => item.warningType === WarningTypes.MISSING_REQUIRED_BUSINESS_INFO)){
    alertList.push({ alertType: AlertTypesE.MISSINGINFO });
  }

  return alertList;
});
</script>
