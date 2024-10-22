<script setup lang="ts">
import { CorpTypeCd, FilingTypes } from '@bcrs-shared-components/enums'

const route = useRoute()
const t = useNuxtApp().$i18n.t

const business = useBcrosBusiness()
const { currentParties, currentBusinessAddresses, currentBusiness } = storeToRefs(business)
const { isStaffAccount } = useBcrosAccount()

const bootstrap = useBcrosBusinessBootstrap()
const { bootstrapFiling, bootstrapFilingType, bootstrapIdentifier, bootstrapLegalType } = storeToRefs(bootstrap)

const { todos } = storeToRefs(useBcrosTodos())
const { filings } = storeToRefs(useBcrosFilings())
const { pendingFilings } = storeToRefs(useBcrosBusinessBootstrap())

const hasDirector = computed(() => {
  if (currentParties.value?.parties && currentParties.value?.parties.length > 0) {
    return containRole(RoleTypeE.DIRECTOR)
  }
  return false
})

const hasPartner = computed(() => {
  if (currentParties.value?.parties && currentParties.value.parties.length > 0) {
    return containRole(RoleTypeE.PARTNER)
  }
  return false
})

const hasProprietor = computed(() => {
  if (currentParties.value?.parties && currentParties.value.parties.length > 0) {
    return containRole(RoleTypeE.PROPRIETOR)
  }
  return false
})

const hasCustodian = computed(() => {
  if (currentParties.value?.parties && currentParties.value.parties.length > 0) {
    return containRole(RoleTypeE.CUSTODIAN)
  }
  return false
})

const showCustodian = computed(() => {
  return hasCustodian.value && currentBusiness.value.state === BusinessStateE.HISTORICAL
})

const bootstrapOfficeTitle = computed(() => {
  return bootstrapFilingType.value === FilingTypes.REGISTRATION
    ? t('title.section.businessAddresses')
    : t('title.section.officeAddresses')
})
const bootstrapOffices = computed(() => {
  return bootstrapFilingType.value === FilingTypes.REGISTRATION
    ? [{}]
    : [{ title: t('label.address.officeType.registered') }, { title: t('label.address.officeType.records') }]
})

const bootstrapPartiesTitle = computed(() => {
  if (bootstrapFilingType.value === FilingTypes.REGISTRATION) {
    return bootstrapLegalType.value === CorpTypeCd.SOLE_PROP
      ? t('title.section.proprietors')
      : t('title.section.partners')
  }
  return t('title.section.currentDirectors')
})

// check if the business has a party that has a certain role type
const containRole = (roleType) => {
  return currentParties.value?.parties.find(party =>
    party.roles.find(role => role.roleType === roleType && !role.cessationDate)
  )
}

// load information for the business or the bootstrap business,
// and load the todo tasks, pending-review item, and filing history
const loadBusinessInfo = async (force = false) => {
  const identifier = route.params.identifier as string
  if (identifier) {
    if (bootstrap.checkIsTempReg(identifier)) {
      // this is a business bootstrap (actual business does not exist yet)
      await bootstrap.loadBusinessBootstrap(identifier, force)

      // add the bootstrap item to the To Do, Pending or Filing History section.
      if (bootstrap.isBootstrapTodo) {
        useBcrosTodos().loadBootstrapTask({
          enabled: true,
          order: 0,
          task: { filing: bootstrapFiling.value.filing }
        } as TaskI)
      } else if (bootstrap.isBootstrapFiling) {
        useBcrosFilings().loadBootstrapFiling(bootstrapFiling.value)
      } else if (bootstrap.isBootstrapPending) {
        bootstrap.loadPendingFiling()
      }
    } else {
      await business.loadBusiness(identifier, force)
      business.loadBusinessAddresses(identifier, force)
      business.loadParties(identifier, force)
      useBcrosFilings().loadFilings(identifier, force)
      useBcrosTodos().loadAffiliations(identifier)
      useBcrosTodos().loadTasks(identifier, true)
    }
  }
}

const reloadBusinessInfo = async () => {
  useBcrosTodos().clearTodos()
  useBcrosFilings().clearFilings()
  // TO-DO: also need to clear the pending filing list (not yet implemented)

  // reload business info using the force=true flag
  await loadBusinessInfo(true)
}

onBeforeMount(async () => {
  await loadBusinessInfo()
})

const alerts = computed((): Array<Partial<AlertI>> => {
  const allWarnings = currentBusiness.value?.warnings || []
  const alertList: Array<Partial<AlertI>> = []
  if (currentBusiness.value?.adminFreeze) {
    alertList.push({ alertType: AlertTypesE.FROZEN })
  }
  if ((currentBusiness.value?.goodStanding === false) ||
    (allWarnings.some(item => item.warningType === WarningTypesE.NOT_IN_GOOD_STANDING))) {
    alertList.push({ alertType: AlertTypesE.STANDING })
  }
  if ((allWarnings.some(item => item.warningType === WarningTypesE.INVOLUNTARY_DISSOLUTION)) ||
    (currentBusiness.value?.inDissolution)) {
    let days = null
    const warning = allWarnings.find(item =>
      item.warningType?.includes(WarningTypesE.INVOLUNTARY_DISSOLUTION)
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

  if (allWarnings.some(item => item.warningType === WarningTypesE.COMPLIANCE)) {
    alertList.push({ alertType: AlertTypesE.COMPLIANCE })
  }
  // Removed for 22891 -- TODO: we might re-add this and the check might be different
  // if (currentBusiness.value?.state !== 'ACTIVE') {
  // alertList.push({ alertType: AlertTypesE.DISABLED })
  // }

  if (allWarnings.some(item => item.warningType === WarningTypesE.FUTURE_EFFECTIVE_AMALGAMATION)) {
    const warning = allWarnings.find(item =>
      item.warningType?.includes(WarningTypesE.FUTURE_EFFECTIVE_AMALGAMATION)
    )
    const amalDate = warning?.data?.amalgamationDate as string
    alertList.push({ alertType: AlertTypesE.AMALGAMATION, date: amalDate })
  }

  if (allWarnings.some(item => item.warningType === WarningTypesE.MISSING_REQUIRED_BUSINESS_INFO)) {
    alertList.push({ alertType: AlertTypesE.MISSINGINFO })
  }

  return alertList
})

const pendingAddress = computed(() => {
  const currentDate = new Date()
  if (filings && filings.value && filings.value.length > 0) {
    const coaFilings = filings.value.filter((filing) => {
      return filing.name === FilingTypes.CHANGE_OF_ADDRESS
    })
    coaFilings.sort((a, b) => {
      return new Date(b.effectiveDate) - new Date(a.effectiveDate)
    })
    const coaFiling = coaFilings[0]
    if (coaFiling?.effectiveDate && new Date(coaFiling?.effectiveDate) > currentDate) {
      return true
    }
  }
  return false
})

const isChangeAddressDisabled = computed(() => business.currentBusiness.adminFreeze || pendingAddress.value)
const isChangeDirectorDisabled = computed(() => business.currentBusiness.adminFreeze)

</script>

<template>
  <div class="mt-8 mb-16 flex flex-wrap" data-cy="business-dashboard">
    <div class="md:w-9/12 bcros-dash-col">
      <BcrosSection v-if="alerts && alerts.length>0" name="alerts">
        <template #header>
          {{ $t('title.section.alert') }} <span class="font-normal">({{ alerts.length }})</span>
        </template>
        <BcrosAlertList :alerts="alerts" :contact="true" />
      </BcrosSection>

      <BcrosSection name="todo">
        <template #header>
          {{ $t('title.section.toDo') }} <span class="font-normal">({{ todos.length }})</span>
        </template>
        <BcrosTodoList
          :todos="todos"
          class="bg-bcGovGray-100"
          @reload="async () => {
            await reloadBusinessInfo()
          }"
        />
      </BcrosSection>

      <BcrosSection v-if="pendingFilings && pendingFilings.length > 0" name="pending">
        <template #header>
          Pending <span class="font-normal">({{ pendingFilings.length }})</span>
        </template>
        <BcrosPendingList
          :pending-filings="pendingFilings"
        />
      </BcrosSection>

      <BcrosSection name="filingHistory">
        <template #header>
          <div>
            {{ $t('title.section.filingHistory') }}
            <span class="font-normal">({{ filings?.length || 0 }})</span>
            <BcrosFilingAddStaffFiling v-if="isStaffAccount" class="float-right font-small overflow-auto" />
          </div>
        </template>
        <!-- {{ filings }} -->
        <BcrosFilingList :filings="filings" />
      </BcrosSection>
    </div>

    <div v-if="!!bootstrapIdentifier" class="bcros-dash-col bcros-dash-side-col">
      <BcrosSection name="temp-reg-offices">
        <template #header>
          {{ bootstrapOfficeTitle }}
        </template>
        <BcrosOfficeAddressBootstrap :items="bootstrapOffices" />
      </BcrosSection>
      <BcrosSection name="temp-reg-parties">
        <template #header>
          {{ bootstrapPartiesTitle }}
        </template>
        <div class="flex justify-center py-5">
          <p>{{ $t('text.filing.completeYourFiling') }}</p>
        </div>
      </BcrosSection>
    </div>
    <div v-else-if="!!currentBusiness" class="bcros-dash-col bcros-dash-side-col">
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

      <BcrosSection name="address">
        <template #header>
          <div class="flex justify-between">
            <span v-if="currentBusinessAddresses?.businessOffice">
              {{ $t('title.section.businessAddresses') }}
            </span>
            <span v-else>
              {{ $t('title.section.officeAddresses') }}
            </span>
            <UBadge
              v-if="pendingAddress"
              data-cy="address-pending-badge"
              class="bg-yellow-pending py-2 h-[24px] mt-[14px] text-black"
              variant="solid"
            >
              {{ $t('label.general.pending') }}
            </UBadge>
            <UButton
              variant="ghost"
              icon="i-mdi-pencil"
              :disabled="isChangeAddressDisabled"
              :label="$t('button.general.change')"
              data-cy="address-change-button"
              @click="()=>{
                // TO-DO  confirm the redirect logic
                console.log('clicked!')
              }"
            />
          </div>
        </template>
        <BcrosOfficeAddress
          name="officeAddresses"
          :expand-top-item="!showCustodian"
          :pending-address="pendingAddress"
        />
      </BcrosSection>

      <BcrosSection v-if="hasDirector" name="directors">
        <template #header>
          <div class="flex justify-between">
            <span>
              {{ $t('title.section.currentDirectors') }}
            </span>
            <UButton
              variant="ghost"
              icon="i-mdi-pencil"
              :disabled="isChangeDirectorDisabled"
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

      <BcrosSection v-if="hasPartner" name="partner">
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

      <BcrosSection v-if="hasProprietor" name="proprietors">
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
<style lang="scss" scoped>
.bcros-dash-col {
  @apply flex flex-col space-y-5
}

.bcros-dash-side-col {
  @apply md:w-3/12 md:pl-5 md:pt-0
}
</style>
