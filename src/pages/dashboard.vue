<template>
  <div class="mt-8 mb-16 flex flex-wrap" data-cy="business-dashboard">
    <div class="w-full md:w-9/12">
      <BcrosSection v-if="alerts && alerts.length>0" class="pb-5" name="alerts">
        <template #header>
          {{ $t('title.section.alert') }}({{ alerts.length }})
        </template>
        <BcrosAlertList :alerts="alerts" :contact="true" />
      </BcrosSection>
      <BcrosSection name="todo" v-if="todos.length > 0">
        <template #header>
          {{ $t('title.section.toDo') }} <span class="font-normal">({{ todos.length }})</span>
        </template>
        <BcrosTodoList :todos="todos" />
      </BcrosSection>

      <BcrosSection name="filingHistory" class="pt-5">
        <template #header>
          {{ $t('title.section.filingHistory') }}
        </template>
        TBD
      </BcrosSection>
    </div>

    <div class="w-full pt-5 md:w-3/12 md:pl-5 md:pt-0 flex flex-col">
      <BcrosSection v-if="showCustodian" name="custodian">
        <template #header>
          <div class="flex justify-between">
            <span>
              {{ $t('title.section.custodianOfRecords') }}
            </span>
          </div>
        </template>
        <BcrosPartyInfo name="custodian" :role-type="RoleTypeE.CUSTODIAN" :show-email="false" :expand-top-item="true" />
      </BcrosSection>

      <BcrosSection name="address" :class="showCustodian ? 'pt-5' : ''">
        <template #header>
          <div class="flex justify-between">
            <span v-if="currentBusinessAddresses.businessOffice">
              {{ $t('title.section.businessAddresses') }}
            </span>
            <span v-else>
              {{ $t('title.section.officeAddresses') }}
            </span>
            <UButton
              variant="ghost"
              icon="i-mdi-pencil"
              :label="$t('button.general.change')"
              data-cy="address-change-button"
              @click="()=>{
                // TO-DO  confirm the redirect logic
                console.log('clicked!')
              }"
            />
          </div>
        </template>
        <BcrosOfficeAddress name="officeAddresses" :expand-top-item="!showCustodian" />
      </BcrosSection>

      <BcrosSection v-if="hasDirector" name="directors" class="pt-5">
        <template #header>
          <div class="flex justify-between">
            <span>
              {{ $t('title.section.currentDirectors') }}
            </span>
            <UButton
              variant="ghost"
              icon="i-mdi-pencil"
              :label="$t('button.general.change')"
              data-cy="change-button"
              @click="()=>{
                // TO-DO  confirm the redirect logic
                console.log('clicked!')
              }"
            />
          </div>
        </template>
        <BcrosPartyInfo name="directors" :role-type="RoleTypeE.DIRECTOR" :show-email="false" />
      </BcrosSection>

      <BcrosSection v-if="hasPartner" name="partner" class="pt-5">
        <template #header>
          <div class="flex justify-between">
            <span>
              {{ $t('title.section.partners') }}
            </span>
            <UButton
              variant="ghost"
              icon="i-mdi-pencil"
              :label="$t('button.general.change')"
              data-cy="change-button"
              @click="()=>{
                // TO-DO  confirm the redirect logic
                console.log('clicked!')
              }"
            />
          </div>
        </template>
        <BcrosPartyInfo name="partners" :role-type="RoleTypeE.PARTNER" :show-email="true" />
      </BcrosSection>

      <BcrosSection v-if="hasProprietor" name="proprietors" class="pt-5">
        <template #header>
          <div class="flex justify-between">
            <span>
              {{ $t('title.section.proprietors') }}
            </span>
            <UButton
              variant="ghost"
              icon="i-mdi-pencil"
              :label="$t('button.general.change')"
              data-cy="change-button"
              @click="()=>{
                // TO-DO  confirm the redirect logic
                console.log('clicked!')
              }"
            />
          </div>
        </template>
        <BcrosPartyInfo name="proprietors" :role-type="RoleTypeE.PROPRIETOR" :show-email="true" />
      </BcrosSection>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'

const route = useRoute()
const business = useBcrosBusiness()
const { todos } = storeToRefs(useBcrosTodos())

const { currentBusinessAddresses, currentBusiness } = storeToRefs(business)

const hasDirector = computed(() => {
  if (business.currentParties.parties && business.currentParties.parties.length > 0) {
    return containRole(RoleTypeE.DIRECTOR)
  }
  return false
})

const hasPartner = computed(() => {
  if (business.currentParties.parties && business.currentParties.parties.length > 0) {
    return containRole(RoleTypeE.PARTNER)
  }
  return false
})

const hasProprietor = computed(() => {
  if (business.currentParties.parties && business.currentParties.parties.length > 0) {
    return containRole(RoleTypeE.PROPRIETOR)
  }
  return false
})

const hasCustodian = computed(() => {
  if (business.currentParties.parties && business.currentParties.parties.length > 0) {
    return containRole(RoleTypeE.CUSTODIAN)
  }
  return false
})

const showCustodian = computed(() => {
  return hasCustodian.value && currentBusiness.value.state === BusinessStateE.HISTORICAL
})

// check if the business has a party that has a certain role type
const containRole = (roleType) => {
  return business.currentParties.parties.find(party =>
    party.roles.find(role => role.roleType === roleType && !role.cessationDate)
  )
}
const loadBusinessInfo = () => {
  if (route.params.identifier) {
    business.loadBusinessAddresses(route.params.identifier as string)
    business.loadParties(route.params.identifier as string)
    business.loadBusiness(route.params.identifier as string)
  }
}

onBeforeMount(() => {
  loadBusinessInfo()
})

const alerts = computed((): Array<Partial<AlertI>> => {
  const allWarnings = currentBusiness.value?.warnings || []
  const alertList: Array<Partial<AlertI>> = []
  if (currentBusiness.value?.adminFreeze) {
    alertList.push({ alertType: AlertTypesE.FROZEN })
  }
  if ((currentBusiness.value?.goodStanding === false) ||
  (allWarnings.some(item => item.warningType === WarningTypes.NOT_IN_GOOD_STANDING))) {
    alertList.push({ alertType: AlertTypesE.STANDING })
  }
  if ((allWarnings.some(item => item.warningType === WarningTypes.INVOLUNTARY_DISSOLUTION)) ||
  (currentBusiness.value?.inDissolution)) {
    let days = null
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
    alertList.push({ alertType: AlertTypesE.DISSOLUTION, date: days })
  }

  if (allWarnings.some(item => item.warningType === WarningTypes.COMPLIANCE)) {
    alertList.push({ alertType: AlertTypesE.COMPLIANCE })
  }

  if (currentBusiness.value?.state !== 'ACTIVE') {
    alertList.push({ alertType: AlertTypesE.DISABLED })
  }

  if (allWarnings.some(item => item.warningType === WarningTypes.FUTURE_EFFECTIVE_AMALGAMATION)) {
    const warning = allWarnings.find(item =>
      item.warningType?.includes(WarningTypes.FUTURE_EFFECTIVE_AMALGAMATION)
    )
    const amalDate = warning?.data?.amalgamationDate as string
    alertList.push({ alertType: AlertTypesE.AMALGAMATION, date: amalDate })
  }

  if (allWarnings.some(item => item.warningType === WarningTypes.MISSING_REQUIRED_BUSINESS_INFO)) {
    alertList.push({ alertType: AlertTypesE.MISSINGINFO })
  }

  return alertList
})
</script>
