<script setup lang="ts">
import type { ComputedRef } from 'vue'
import type { DropdownItem } from '#ui/types'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { FilingSubTypeE } from '~/enums/filing-sub-type-e'
import { useBcrosDashboardActions } from '~/stores/dashboardActions'
import { LDFlags } from '~/enums/ld-flags'

const { currentBusiness } = storeToRefs(useBcrosBusiness())
const { goToBusinessCorpsUI, goToDigitalCredentialsPage, goToFilingsUI } = useBcrosNavigate()

const { isAllowedToFile, isAllowed } = useBcrosBusiness()
const { isButtonForActionVisible } = useBcrosDashboardActions()
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
        getStoredFlag(LDFlags.EnableDigitalCredentials),
      disabled: false,
      label: t('button.tombstone.menuAction.digitalCredentials'),
      click: () => {
        goToDigitalCredentialsPage()
      },
      tooltip: t('tooltip.tombstone.menuAction.digitalCredentials'),
      name: 'digitalCredentials'
    },
    { // <!-- Delay of Dissolution -->
      showButton: isButtonForActionVisible(FilingTypes.DISSOLUTION, FilingSubTypeE.DISSOLUTION_DELAY) &&
        isAuthorized(AuthorizedActionsE.DELAY_DISSOLUTION_FILING),
      disabled: !isAllowed(AllowableActionE.DELAY_DISSOLUTION),
      datacy: 'delay-dissolution',
      label: t('button.tombstone.menuAction.delayDissolution'),
      click: () => {
        goToBusinessCorpsUI(`/dissolution/${currentBusiness.value.identifier}/delay`)
      },
      tooltip: t('tooltip.tombstone.menuAction.delayDissolution'),
      name: 'delayDissolution'
    },
    { // <!-- Dissolve Business -->
      showButton:
        isButtonForActionVisible(FilingTypes.DISSOLUTION, FilingSubTypeE.DISSOLUTION_VOLUNTARY) &&
        isAuthorized(AuthorizedActionsE.VOLUNTARY_DISSOLUTION_FILING),
      disabled:
        !getStoredFlag(LDFlags.SupportedDissolutionEntities)?.includes(currentBusiness.value.legalType) ||
        !isAllowedToFile(FilingTypes.DISSOLUTION, FilingSubTypeE.DISSOLUTION_VOLUNTARY) ||
        !isAuthorized(AuthorizedActionsE.VOLUNTARY_DISSOLUTION_FILING),
      label: t('button.tombstone.menuAction.dissolveBusiness'),
      click: () => {
        // open a dialog to confirm dissolution
        emit('dissolve')
      },
      tooltip: t('tooltip.tombstone.menuAction.dissolveBusiness'),
      name: 'dissolveBusiness'
    },
    { // <!-- Consent to Amalgamate Out -->
      showButton:
        getStoredFlag(LDFlags.SupportedConsentAmalgamationOutEntities)?.includes(currentBusiness.value.legalType) &&
        isButtonForActionVisible(FilingTypes.CONSENT_AMALGAMATION_OUT) &&
        isAuthorized(AuthorizedActionsE.CONSENT_AMALGAMATION_OUT_FILING),
      disabled:
        !isAllowedToFile(FilingTypes.CONSENT_AMALGAMATION_OUT) ||
        !isAuthorized(AuthorizedActionsE.CONSENT_AMALGAMATION_OUT_FILING),
      label: t('button.tombstone.menuAction.consentToAmalgamateOut'),
      click: () => {
        goToFilingsUI(`/${currentBusiness.value.identifier}/consent-amalgamation-out`, param)
      },
      tooltip: t('tooltip.tombstone.menuAction.consentToAmalgamateOut'),
      name: 'consentToAmalgamateOut'
    },
    { // <!-- Consent to Continue Out -->

      showButton:
        getStoredFlag(LDFlags.SupportedConsentContinuationOutEntities)?.includes(currentBusiness.value.legalType) &&
        isButtonForActionVisible(FilingTypes.CONSENT_CONTINUATION_OUT) &&
        isAuthorized(AuthorizedActionsE.CONSENT_CONTINUATION_OUT_FILING),
      disabled:
        !isAllowedToFile(FilingTypes.CONSENT_CONTINUATION_OUT) ||
        !isAuthorized(AuthorizedActionsE.CONSENT_CONTINUATION_OUT_FILING),
      label: t('button.tombstone.menuAction.consentToContinueOut'),
      click: () => {
        goToFilingsUI(`/${currentBusiness.value.identifier}/consent-continuation-out`, param)
      },
      tooltip: t('tooltip.tombstone.menuAction.consentToContinueOut'),
      name: 'consentToContinueOut'
    },
    { // <!-- Request AGM Extension -->
      showButton:
        getStoredFlag(LDFlags.SupportedAgmExtensionEntities)?.includes(currentBusiness.value.legalType) &&
        isButtonForActionVisible(FilingTypes.AGM_EXTENSION) && isAuthorized(AuthorizedActionsE.AGM_EXTENSION_FILING),
      disabled:
        !isAllowedToFile(FilingTypes.AGM_EXTENSION) ||
        !isAuthorized(AuthorizedActionsE.AGM_EXTENSION_FILING),
      label: t('button.tombstone.menuAction.requestAgmExtension'),
      click: () => {
        goToFilingsUI(`/${currentBusiness.value.identifier}/agm-extension`, param)
      },
      tooltip:
        !isAllowedToFile(FilingTypes.AGM_EXTENSION)
          ? t('tooltip.tombstone.menuAction.requirementsForRequestAgmExtension')
          : t('tooltip.tombstone.menuAction.requestAgmExtension'),
      name: 'requestAgmExtension'
    },
    { // <!-- Request AGM Location Change -->
      showButton:
        getStoredFlag(LDFlags.SupportedAgmLocationChgEntities)?.includes(currentBusiness.value.legalType) &&
        isButtonForActionVisible(FilingTypes.AGM_LOCATION_CHANGE) &&
        isAuthorized(AuthorizedActionsE.AGM_CHG_LOCATION_FILING),
      disabled:
        !isAllowedToFile(FilingTypes.AGM_LOCATION_CHANGE) ||
        !isAuthorized(AuthorizedActionsE.AGM_CHG_LOCATION_FILING),
      label: t('button.tombstone.menuAction.requestAgmLocationChange'),
      click: () => {
        goToFilingsUI(`/${currentBusiness.value.identifier}/agm-location-chg`, param)
      },
      tooltip:
        !isAllowedToFile(FilingTypes.AGM_EXTENSION)
          ? t('tooltip.tombstone.menuAction.requirementsForRequestAgmLocationChange')
          : t('tooltip.tombstone.menuAction.requestAgmLocationChange'),
      name: 'requestAgmLocationChange'
    },
    { // <!-- Amalgamate -->
      showButton:
        getStoredFlag(LDFlags.SupportedAmalgamationEntities)?.includes(currentBusiness.value.legalType) &&
        isButtonForActionVisible(FilingTypes.AMALGAMATION_APPLICATION) &&
        isAuthorized(AuthorizedActionsE.AMALGAMATION_FILING),
      disabled:
        !isAllowedToFile(FilingTypes.AMALGAMATION_APPLICATION) ||
        !isAuthorized(AuthorizedActionsE.AMALGAMATION_FILING),
      label: t('button.tombstone.menuAction.amalgamate'),
      click: () => {
        goToFilingsUI(`/${currentBusiness.value.identifier}/amalgamation-selection`)
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
          :disabled="item.disabled"
          :data-cy="'button.' + item.name"
          class="w-full text-nowrap disabled:opacity-50"
          @click.stop="item.click"
        />
      </BcrosTooltip>
      <div v-else class="w-full">
        <UButton
          variant="ghost"
          :label="item.label"
          class="w-full text-nowrap"
          @click.stop="item.click"
        />
      </div>
    </template>
  </UDropdown>
</template>
