<script setup lang="ts">
import type { ComputedRef } from 'vue'
import type { DropdownItem } from '#ui/types'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { FilingSubTypeE } from '~/enums/filing-sub-type-e'

const { currentBusiness } = storeToRefs(useBcrosBusiness())
const { goToDigitalCredentialsPage, goToBusinessDashboard } = useBcrosNavigate()

const { isAllowedToFile } = useBcrosBusiness()
const { getStoredFlag } = useBcrosLaunchdarkly()
const t = useNuxtApp().$i18n.t

const emit = defineEmits(['dissolve'])

interface MenuActionItem extends DropdownItem {
  showButton: boolean
  tooltip?: string
  name?: string
}

const param = { filingId: '0' }

const allActions: ComputedRef<Array<MenuActionItem>> = computed(() => {
  return [
    { // <!-- View/Add Digital Credentials -->
      showButton: !!currentBusiness.value?.allowedActions?.digitalBusinessCard &&
        getStoredFlag('enable-digital-credentials'),
      disabled: false,
      label: t('button.tombstone.menuAction.digitalCredentials'),
      click: () => {
        goToDigitalCredentialsPage()
      },
      tooltip: t('tooltip.tombstone.menuAction.digitalCredentials'),
      name: 'digitalCredentials'
    },
    { // <!-- Dissolve Business -->
      showButton: currentBusiness.value.state !== BusinessStateE.HISTORICAL,
      disabled:
        !getStoredFlag('supported-dissolution-entities')?.includes(currentBusiness.value.legalType) &&
        !isAllowedToFile(FilingTypes.DISSOLUTION, FilingSubTypeE.DISSOLUTION_VOLUNTARY),
      label: t('button.tombstone.menuAction.dissolveBusiness'),
      click: () => {
        // open a dialog to confirm dissolution
        emit('dissolve')
      },
      tooltip: t('tooltip.tombstone.menuAction.dissolveBusiness'),
      name: 'dissolveBusiness'
    },
    { // <!-- Consent to Amalgamate Out -->
      showButton: currentBusiness.value.state !== BusinessStateE.HISTORICAL,
      disabled: !isAllowedToFile(FilingTypes.CONSENT_AMALGAMATION_OUT),
      label: t('button.tombstone.menuAction.consentToAmalgamateOut'),
      click: () => {
        goToBusinessDashboard(`/${currentBusiness.value.identifier}/consent-amalgamation-out'`, param)
      },
      tooltip: t('tooltip.tombstone.menuAction.consentToAmalgamateOut'),
      name: 'consentToAmalgamateOut'
    },
    { // <!-- Consent to Continue Out -->
      showButton: currentBusiness.value.state !== BusinessStateE.HISTORICAL,
      disabled: !isAllowedToFile(FilingTypes.CONSENT_CONTINUATION_OUT),
      label: t('button.tombstone.menuAction.consentToContinueOut'),
      click: () => {
        goToBusinessDashboard(`/${currentBusiness.value.identifier}/consent-continuation-out`, param)
      },
      tooltip: t('tooltip.tombstone.menuAction.consentToContinueOut'),
      name: 'consentToContinueOut'
    },
    { // <!-- Request AGM Extension -->
      showButton: currentBusiness.value.state !== BusinessStateE.HISTORICAL,
      disabled: !isAllowedToFile(FilingTypes.AGM_EXTENSION),
      label: t('button.tombstone.menuAction.requestAgmExtension'),
      click: () => {
        goToBusinessDashboard(`/${currentBusiness.value.identifier}/agm-extension`, param)
      },
      tooltip:
        !isAllowedToFile(FilingTypes.AGM_EXTENSION)
          ? t('tooltip.tombstone.menuAction.requirementsForRequestAgmExtension')
          : t('tooltip.tombstone.menuAction.requestAgmExtension'),
      name: 'requestAgmExtension'
    },
    { // <!-- Request AGM Location Change -->
      showButton: currentBusiness.value.state !== BusinessStateE.HISTORICAL,
      disabled: !isAllowedToFile(FilingTypes.AGM_LOCATION_CHANGE),
      label: t('button.tombstone.menuAction.requestAgmLocationChange'),
      click: () => {
        goToBusinessDashboard(`/${currentBusiness.value.identifier}/agm-location-chg`, param)
      },
      tooltip:
        !isAllowedToFile(FilingTypes.AGM_EXTENSION)
          ? t('tooltip.tombstone.menuAction.requirementsForRequestAgmLocationChange')
          : t('tooltip.tombstone.menuAction.requestAgmLocationChange'),
      name: 'requestAgmLocationChange'
    },
    { // <!-- Amalgamate -->
      showButton: currentBusiness.value.state !== BusinessStateE.HISTORICAL,
      disabled: !isAllowedToFile(FilingTypes.AGM_LOCATION_CHANGE),
      label: t('button.tombstone.menuAction.amalgamate'),
      click: () => {
        goToBusinessDashboard(`/${currentBusiness.value.identifier}/amalgamation-selection`)
      },
      tooltip:
        currentBusiness.value.adminFreeze
          ? t('tooltip.tombstone.menuAction.isNotFrozenForAmalgamate')
          : t('tooltip.tombstone.menuAction.amalgamate'),
      name: 'amalgamate'
    }]
})

const actions: ComputedRef<Array<Array<MenuActionItem>>> = computed(() => {
  const allowedActions = allActions.value.filter(action => action.showButton)
  return [allowedActions]
})

</script>

<template>
  <UDropdown
    v-if="actions[0].length"
    :items="actions"
    :popper="{ placement: 'bottom-start' }"
    :ui="{
      container: 'w-auto'
    }"
    padding="p3"
    data-cy="button.moreActions"
  >
    <UButton
      variant="ghost"
      trailing-icon="i-mdi-chevron-down"
      class="w-full text-nowrap"
    >
      {{ $t('button.tombstone.moreActions') }}
    </UButton>
    <template #item="{ item }">
      <BcrosTooltip
        v-if="item.tooltip"
        :text="item.tooltip"
        :popper="{
          placement: 'right',
          arrow: true
        }"
      >
        <UButton
          variant="ghost"
          :label="item.label"
          :data-cy="'button.' + item.name"
          class="w-full text-nowrap"
          @click="item.click"
        />
      </BcrosTooltip>
      <div v-else class="w-full">
        <UButton variant="ghost" :label="item.label" class="w-full text-nowrap" @click="item.click" />
      </div>
    </template>
  </UDropdown>
</template>
