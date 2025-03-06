<script setup lang="ts">
import { CorpTypeCd, FilingTypes } from '@bcrs-shared-components/enums'

const route = useRoute()
const t = useNuxtApp().$i18n.t

const business = useBcrosBusiness()
const { currentParties, currentBusinessAddresses, currentBusiness, isHistorical } = storeToRefs(business)

const { goToEditUI } = useBcrosNavigate()

const { isStaffAccount } = useBcrosAccount()

const bootstrap = useBcrosBusinessBootstrap()
const { bootstrapFiling, bootstrapFilingType, bootstrapIdentifier, bootstrapLegalType } = storeToRefs(bootstrap)

const { todos } = storeToRefs(useBcrosTodos())
const { getPendingCoa } = useBcrosFilings()
const { filings } = storeToRefs(useBcrosFilings())
const { pendingFilings } = storeToRefs(useBcrosBusinessBootstrap())
const toast = useToast()
const initialDateString = ref<Date | undefined>(undefined)
const ui = useBcrosDashboardUi()

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
    : [{ title: t('label.address.officeType.registered'), field: 'registeredOffice' },
        { title: t('label.address.officeType.records'), field: 'recordsOffice' }]
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

const fetchBusinessDetailsWithDelay = async (identifier: string) => {
  try {
    const slimBusiness = await business.getBusinessDetails(identifier, undefined, true)
    const lastModifiedDate = slimBusiness.lastModified ? apiToDate(slimBusiness.lastModified) : null
    const initialDate = business.initialDateString ? business.initialDateString : null

    if (lastModifiedDate && initialDate && lastModifiedDate.getTime() > initialDate.getTime()) {
      toast.add({
        id: 'outdated_data',
        title: 'Details on this page have been updated. Refresh to view the latest information.',
        timeout: 0,
        actions: [{
          label: 'Refresh',
          variant: 'refresh',
          color: 'primary',
          click: () => {
            reloadBusinessInfo()
          }
        }]
      })
    }
  } catch (error) {
    console.error('Error fetching business details:', error)
  }
}

let pollingInterval: NodeJS.Timer | null = null
let startTime: number = 0

const startPolling = (identifier: string) => {
  if (pollingInterval) { return } // Prevent starting if polling is active

  startTime = Date.now()

  const poll = () => {
    const elapsedTime = Date.now() - startTime
    let interval = 1000 // Default to 1 second

    if (elapsedTime < 10000) {
      interval = 1000 // Poll every 1 second for 10 seconds
    } else if (elapsedTime < 60000) {
      interval = 10000 // Poll every 10 seconds for next 50 seconds
    } else if (elapsedTime < 1800000) {
      interval = 60000 // Poll every 1 minute for next 29 minutes
    } else {
      interval = 3600000
    } // Poll every 1 hour after 30 minutes

    fetchBusinessDetailsWithDelay(identifier)
    pollingInterval = setTimeout(poll, interval)
  }

  poll()
}

const stopPolling = () => {
  if (pollingInterval) { clearTimeout(pollingInterval) }
  pollingInterval = null
}

const handleButtonClicked = () => {
  const identifier = route.params.identifier as string
  stopPolling()
  startPolling(identifier)
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
      await Promise.all([
        business.loadBusinessAddresses(identifier, force),
        business.loadParties(identifier, force),
        useBcrosFilings().loadFilings(identifier, force),
        useBcrosTodos().loadAffiliations(identifier),
        useBcrosTodos().loadTasks(identifier, true)
      ])
    }
    // assign initial value from /business
    initialDateString.value = business.initialDateString
    // TO-DO: determine how to detect changes to a T business after dashboard loads
    // start polling schedule for regular business only
    if (!bootstrap.checkIsTempReg(identifier)) {
      startPolling(identifier)
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
    alertList.push({ alertType: AlertTypesE.FROZEN, options: {} })
  }
  if ((currentBusiness.value?.goodStanding === false) ||
    (allWarnings.some(item => item.warningType === WarningTypesE.NOT_IN_GOOD_STANDING))) {
    alertList.push({ alertType: AlertTypesE.STANDING, options: {} })
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
    alertList.push({ alertType: AlertTypesE.DISSOLUTION, date: days, options: {} })
  }

  if (allWarnings.some(item => item.warningType === WarningTypesE.COMPLIANCE)) {
    alertList.push({ alertType: AlertTypesE.COMPLIANCE, options: {} })
  }
  // Removed for 22891 -- TODO: we might re-add this and the check might be different
  // if (currentBusiness.value?.state !== 'ACTIVE') {
  // alertList.push({ alertType: AlertTypesE.DISABLED, options: {} })
  // }

  if (allWarnings.some(item => item.warningType === WarningTypesE.FUTURE_EFFECTIVE_AMALGAMATION)) {
    const warning = allWarnings.find(item =>
      item.warningType?.includes(WarningTypesE.FUTURE_EFFECTIVE_AMALGAMATION)
    )
    const amalDate = dateToPacificDate(new Date(warning?.data?.amalgamationDate as string), true)
    alertList.push({ alertType: AlertTypesE.AMALGAMATION, date: amalDate, options: { date: amalDate } })
  }

  if (allWarnings.some(item => item.warningType === WarningTypesE.MISSING_REQUIRED_BUSINESS_INFO)) {
    alertList.push({ alertType: AlertTypesE.MISSINGINFO, options: {} })
  }

  return alertList
})

const pendingAddress = computed(() => {
  const currentDate = new Date()
  if (filings && filings.value && filings.value.length > 0) {
    const coaFilings = filings.value.filter((filing) => {
      return (filing.name === FilingTypes.CHANGE_OF_ADDRESS) && (filing.status !== FilingStatusE.WITHDRAWN)
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

const showChangeOfAddress = ref(false)

const setChangeOfAddress = (show: boolean) => {
  showChangeOfAddress.value = show
}

const goToStandaloneAddresses = () => {
  const baseUrl = useRuntimeConfig().public.filingsURL
  const url = `${baseUrl}/${business.currentBusinessIdentifier}/standalone-addresses?filingId=0`
  navigateTo(url, { external: true })
}

const changeAddress = () => {
  if (business.isEntityFirm()) {
    const baseUrl = useRuntimeConfig().public.editURL
    const url = `${baseUrl}/${business.currentBusinessIdentifier}/change`
    navigateTo(url, { external: true })
  } else if (business.isBaseCompany()) {
    setChangeOfAddress(true)
  } else {
    goToStandaloneAddresses()
  }
}

const goToStandaloneDirectors = () => {
  const baseUrl = useRuntimeConfig().public.filingsURL
  const url = `${baseUrl}/${business.currentBusinessIdentifier}/standalone-directors?filingId=0`
  navigateTo(url, { external: true })
}

const changePartyInfo = () => {
  if (business.isEntityFirm()) {
    goToEditUI(`/${currentBusiness.value.identifier}/change`)
  } else {
    goToStandaloneDirectors()
  }
}

const coaDialogOptions = computed<DialogOptionsI>(() => {
  const title = t('title.dialog.coa')
  return {
    title,
    text: '', // content slot is used
    hideClose: true,
    buttons: [] as DialogButtonI[], // button slot is used
    alertIcon: false
  }
})

// The COA effective date, if a COA is pending, else null
const coaEffectiveDate = computed(() => {
  const pendingCoa = getPendingCoa()
  return pendingCoa ? new Date(pendingCoa.effectiveDate) : null
})

</script>

<template>
  <UNotifications />
  <BcrosDialogCardedModal
    name="confirmChangeofAddress"
    :display="showChangeOfAddress"
    :options="coaDialogOptions"
    @close="setChangeOfAddress(false)"
  >
    <template #content>
      <p>
        {{ $t('text.dialog.coa.p1') }}
      </p>
      <br></br>
      <p>
        {{ $t('text.dialog.coa.p2') }}
      </p>
    </template>
    <template #buttons>
      <div>
        <UButton
          variant="link"
          @click="setChangeOfAddress(false)"
        >
          {{ $t('text.dialog.coa.cancel') }}
        </UButton>
        <UButton
          variant="link"
          class="float-right"
          data-cy="continue-to-coa-button"
          @click="goToStandaloneAddresses()"
        >
          {{ $t('text.dialog.coa.continue') }}
        </UButton>
      </div>
    </template>
  </BcrosDialogCardedModal>

  <BcrosDialogCardedModal
    name="downloadError"
    :display="ui.showDownloadingErrorDialog"
    :options="getDownloadFileError()"
    @close="() => ui.showDownloadingErrorDialog = false"
  >
    <template #content>
      <p class="mb-4">
        {{ $t('text.dialog.error.downloadError.text.unableToDownload') }}
      </p>
      <template v-if="!isStaffAccount">
        <p>
          {{ $t('text.dialog.error.downloadError.text.contact') }}
        </p>
        <BcrosContactInfo :contacts="getContactInfo('registries')" class="mt-5" />
      </template>
    </template>
  </BcrosDialogCardedModal>

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
            <span class="font-normal">({{ filings?.filter(f=>f.displayLedger).length || 0 }})</span>
            <BcrosFilingAddStaffFiling
              v-if="isStaffAccount"
              class="float-right font-small overflow-auto"
              @save-local-filing-emit="handleButtonClicked"
            />
          </div>
        </template>
        <BcrosFilingList :filings="filings" />
      </BcrosSection>
    </div>

    <!-- Side Components for Bootstrap Addresses -->
    <div v-if="!!bootstrapIdentifier" class="bcros-dash-col bcros-dash-side-col">
      <BcrosSection name="temp-reg-offices">
        <template #header>
          <div class="flex justify-between">
            <span>{{ bootstrapOfficeTitle }}</span>
            <UButton
              variant="ghost"
              icon="i-mdi-pencil"
              :disabled="true"
              :label="$t('button.general.change')"
              data-cy="address-change-button"
            />
          </div>
        </template>
        <BcrosOfficeAddressBootstrap :items="bootstrapOffices" />
      </BcrosSection>
      <BcrosSection name="temp-reg-parties">
        <template #header>
          <div class="flex justify-between">
            <span>{{ bootstrapPartiesTitle }}</span>
            <UButton
              variant="ghost"
              icon="i-mdi-pencil"
              :disabled="true"
              :label="$t('button.general.change')"
              data-cy="change-button"
            />
          </div>
        </template>
        <div class="flex justify-left">
          <BcrosPartyInfo
            v-if="bootstrapFiling?.filing?.incorporationApplication?.parties"
            name="director"
            :role-type="RoleTypeE.DIRECTOR"
            :show-address="false"
            :show-email="false"
            :expand-top-item="true"
          />
          <p v-else>
            {{ $t('text.filing.completeYourFiling') }}
          </p>
        </div>
      </BcrosSection>
    </div>

    <div v-else-if="!!currentBusiness" class="bcros-dash-col bcros-dash-side-col">
      <!-- Custodian of Records -->
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

      <!-- Office Addresses -->
      <BcrosSection name="address">
        <template #header>
          <div class="flex justify-between items-center">
            <span v-if="currentBusinessAddresses?.businessOffice">
              {{ $t('title.section.businessAddresses') }}
            </span>
            <span v-else>
              {{ $t('title.section.officeAddresses') }}
            </span>
            <BcrosTooltip
              v-if="pendingAddress"
              data-cy="address-pending-tooltip"
              :text="t('tooltip.pendingAddressChange')
                .replace('COA_EFFECTIVE_DATE', dateToPacificDateTime(coaEffectiveDate))"
              :popper="{
                placement: 'top',
                arrow: true
              }"
            >
              <UBadge
                data-cy="address-pending-badge"
                class="bg-yellow-pending py-2 px-1 h-[24px] text-black"
                variant="solid"
              >
                {{ $t('label.general.pending') }}
              </UBadge>
            </BcrosTooltip>
            <UButton
              v-if="!business.isDisableNonBenCorps() && !isHistorical"
              variant="ghost"
              icon="i-mdi-pencil"
              :disabled="!business.isAllowed(AllowableActionE.ADDRESS_CHANGE)"
              :label="$t('button.general.change')"
              data-cy="address-change-button"
              @click="changeAddress"
            />
          </div>
        </template>
        <BcrosOfficeAddress
          name="officeAddresses"
          :expand-top-item="!showCustodian"
          :pending-address="pendingAddress"
        />
      </BcrosSection>

      <!-- Current Director -->
      <BcrosSection v-if="hasDirector" name="directors">
        <template #header>
          <div class="flex justify-between">
            <span>
              {{ $t('title.section.currentDirectors') }}
            </span>
            <UButton
              v-if="!business.isDisableNonBenCorps() && !isHistorical"
              variant="ghost"
              icon="i-mdi-pencil"
              :disabled="!business.isAllowed(AllowableActionE.DIRECTOR_CHANGE)"
              :label="$t('button.general.change')"
              data-cy="change-button"
              @click="changePartyInfo"
            />
          </div>
        </template>
        <BcrosPartyInfo name="directors" :role-type="RoleTypeE.DIRECTOR" :show-email="false" />
      </BcrosSection>

      <!-- Partners -->
      <BcrosSection v-if="hasPartner" name="partner">
        <template #header>
          <div class="flex justify-between">
            <span>
              {{ $t('title.section.partners') }}
            </span>
            <UButton
              v-if="!isHistorical"
              variant="ghost"
              icon="i-mdi-pencil"
              :disabled="!business.isAllowed(AllowableActionE.DIRECTOR_CHANGE)"
              :label="$t('button.general.change')"
              data-cy="change-button"
              @click="changePartyInfo"
            />
          </div>
        </template>
        <BcrosPartyInfo name="partners" :role-type="RoleTypeE.PARTNER" :show-email="true" />
      </BcrosSection>

      <!-- Proprietor -->
      <BcrosSection v-if="hasProprietor" name="proprietors">
        <template #header>
          <div class="flex justify-between">
            <span>
              {{ $t('title.section.proprietors') }}
            </span>
            <UButton
              v-if="!isHistorical"
              variant="ghost"
              icon="i-mdi-pencil"
              :disabled="!business.isAllowed(AllowableActionE.DIRECTOR_CHANGE)"
              :label="$t('button.general.change')"
              data-cy="change-button"
              @click="changePartyInfo"
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
