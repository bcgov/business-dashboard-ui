<script setup lang="ts">
import type { ComputedRef } from 'vue'
import type { DropdownItem } from '#ui/types'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { FilingSubTypeE } from '~/enums/filing-sub-type-e'

const { currentBusiness } = storeToRefs(useBcrosBusiness())
const { goToDigitalCredentialsPage } = useBcrosNavigate()

const { isAllowedToFile } = useBcrosBusiness()
const { getStoredFlag } = useBcrosLaunchdarkly()
const t = useNuxtApp().$i18n.t

interface MenuActionItem extends DropdownItem {
  showButton: boolean
  tooltip?: string
}

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
      tooltip: t('tooltip.tombstone.menuAction.digitalCredentials')
    },
    { // <!-- Dissolve Business -->
      showButton: currentBusiness.value.state !== BusinessStateE.HISTORICAL,
      disabled:
        !getStoredFlag('supported-dissolution-entities')?.includes(currentBusiness.value.legalType) &&
        !isAllowedToFile(FilingTypes.DISSOLUTION, FilingSubTypeE.DISSOLUTION_VOLUNTARY),
      label: t('button.tombstone.menuAction.dissolveBusiness'),
      click: () => {
        // TO-DO: open a dialog to confirm dissolution; then redirect to the dissolution page, e.g.
        // https://dev.create.business.bcregistry.gov.bc.ca/dissolution-define-dissolution?id=BC0883549&accountid=3040
      },
      tooltip: t('tooltip.tombstone.menuAction.dissolveBusiness')
    },
    { // <!-- Consent to Amalgamate Out -->
      showButton: currentBusiness.value.state !== BusinessStateE.HISTORICAL,
      disabled: !isAllowedToFile(FilingTypes.CONSENT_AMALGAMATION_OUT),
      label: t('button.tombstone.menuAction.consentToAmalgamateOut'),
      click: () => {
        // TO-DO: redirect to the filing page (URL to be confirmed)
      },
      tooltip: t('tooltip.tombstone.menuAction.consentToAmalgamateOut')
    },
    { // <!-- Consent to Continue Out -->
      showButton: currentBusiness.value.state !== BusinessStateE.HISTORICAL,
      disabled: !isAllowedToFile(FilingTypes.CONSENT_CONTINUATION_OUT),
      label: t('button.tombstone.menuAction.consentToContinueOut'),
      click: () => {
        // TO-DO: redirect to https://dev.business.bcregistry.gov.bc.ca/{identifier}/consent-continuation-out
      },
      tooltip: t('tooltip.tombstone.menuAction.consentToContinueOut')
    },
    { // <!-- Request AGM Extension -->
      showButton: currentBusiness.value.state !== BusinessStateE.HISTORICAL,
      disabled: !isAllowedToFile(FilingTypes.AGM_EXTENSION),
      label: t('button.tombstone.menuAction.requestAgmExtension'),
      click: () => {
        // TO-DO: redirect to https://dev.business.bcregistry.gov.bc.ca/{identifier}/agm-extension
      },
      tooltip:
        !isAllowedToFile(FilingTypes.AGM_EXTENSION)
          ? t('tooltip.tombstone.menuAction.requirementsForRequestAgmExtension')
          : t('tooltip.tombstone.menuAction.requestAgmExtension')
    },
    { // <!-- Request AGM Location Change -->
      showButton: currentBusiness.value.state !== BusinessStateE.HISTORICAL,
      disabled: !isAllowedToFile(FilingTypes.AGM_LOCATION_CHANGE),
      label: t('button.tombstone.menuAction.requestAgmLocationChange'),
      click: () => {
        // TO-DO: redirect to https://dev.business.bcregistry.gov.bc.ca/{identifier}/agm-location-chg
      },
      tooltip:
        !isAllowedToFile(FilingTypes.AGM_EXTENSION)
          ? t('tooltip.tombstone.menuAction.requirementsForRequestAgmLocationChange')
          : t('tooltip.tombstone.menuAction.requestAgmLocationChange')
    },
    { // <!-- Amalgamate -->
      showButton: currentBusiness.value.state !== BusinessStateE.HISTORICAL,
      disabled: !isAllowedToFile(FilingTypes.AGM_LOCATION_CHANGE),
      label: t('button.tombstone.menuAction.amalgamate'),
      click: () => {
        // TO-DO: redirect to https://dev.business.bcregistry.gov.bc.ca/{identifier}/amalgamation-selection
      },
      tooltip:
        currentBusiness.value.adminFreeze
          ? t('tooltip.tombstone.menuAction.isNotFrozenForAmalgamate')
          : t('tooltip.tombstone.menuAction.amalgamate')
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
      container: 'bg-blue-500 w-auto'
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
        <UButton variant="ghost" :label="item.label" class="w-full text-nowrap" @click="item.click" />
      </BcrosTooltip>
      <div v-else class="w-full">
        <UButton variant="ghost" :label="item.label" class="w-full text-nowrap" @click="item.click" />
      </div>
    </template>
  </UDropdown>
</template>
