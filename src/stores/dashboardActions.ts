import { CorpTypeCd, FilingTypes } from '@bcrs-shared-components/enums'
import { AuthorizedActionsE } from '~/enums/authorized-actions-e'
import { FilingSubTypeE } from '~/enums/filing-sub-type-e'
import { isAuthorized } from '~/utils/authorizations'
import { useBcrosLegalApi } from '~/composables/useBcrosLegalApi'

/** Manages bcros account data */
export const useBcrosDashboardActions = defineStore('bcros/dashboardActions', () => {
  const visibleActions: Ref<FilingTypeI[]> = ref([])
  const { legalApiURL, legalApiOptions } = useBcrosLegalApi()
  const businessStore = useBcrosBusiness()
  const currentTypeAndStatus = computed((): string => {
    if (!businessStore.currentBusiness) {
      return ''
    }
    return businessStore.currentBusiness.legalType.toUpperCase() +
      '|' +
      businessStore.currentBusiness.state.toUpperCase()
  })

  async function fetchVisibleActions (businessType: string, businessStatus: string) {
    interface CouldFileI {
      couldFile: {
        filing: {
          filingTypes: FilingTypeI[]
        }
      }
    }

    return await useBcrosFetch<CouldFileI>(
      `${legalApiURL}/businesses/allowable/${businessType}/${businessStatus}`, legalApiOptions
    )
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('Error fetching visible actions for', businessType, businessStatus)
          return undefined
        }
        return data?.value?.couldFile?.filing?.filingTypes
      })
  }

  // fetch new set of visible actions each time the requirement changes (either legal type or business state)
  watch(currentTypeAndStatus, (value, oldValue) => {
    if (value && value !== oldValue) {
      fetchVisibleActions(value.split('|')[0], value.split('|')[1]).then((data) => {
        if (data) {
          visibleActions.value = data
        }
      })
    }
  }, { immediate: true })

  const isAllowedToFile = (filingType: FilingTypes, filingSubType?: FilingSubTypeE) => {
    if (!filingType || !(visibleActions.value?.length > 0)) {
      return false
    }

    const requestedFiling = visibleActions.value
      .find(ft => ft.name === filingType && (filingSubType === undefined || ft.type === filingSubType))
    return !!requestedFiling
  }

  // NB: this is intentionally kept the same as the isAllowedActions for now to keep monitoring requirements more easily
  // we can move the other function in the future here, in this store, and then easily replace call to isAllowToFile
  // with generic function that checks scenario depending on the need and injects appropriate function
  const isActionVisible = (action: AllowableActionE) => {
    if (!businessStore.currentBusiness) {
      return false
    }
    const currentBusiness = businessStore.currentBusiness

    const isEntityFirm = businessStore.isEntityFirm
    const isLegalType = businessStore.isLegalType
    const isBusiness = !!currentBusiness.value?.identifier

    const { getFeatureFlag } = useBcrosLaunchdarkly()
    const legalType = currentBusiness.legalType

    switch (action) {
      case AllowableActionE.ADDRESS_CHANGE: {
        if (isEntityFirm()) {
          return isAllowedToFile(FilingTypes.CHANGE_OF_REGISTRATION) &&
                 isAuthorized(AuthorizedActionsE.FIRM_CHANGE_FILING)
        }
        return isAllowedToFile(FilingTypes.CHANGE_OF_ADDRESS) && isAuthorized(AuthorizedActionsE.ADDRESS_CHANGE_FILING)
      }

      case AllowableActionE.ADMINISTRATIVE_DISSOLUTION: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!getFeatureFlag('supported-dissolution-entities')?.includes(legalType)
        return (ff && isAllowedToFile(FilingTypes.DISSOLUTION, FilingSubTypeE.DISSOLUTION_ADMINISTRATIVE) &&
                isAuthorized(AuthorizedActionsE.ADMIN_DISSOLUTION_FILING))
      }

      case AllowableActionE.AGM_EXTENSION: {
        return isAllowedToFile(FilingTypes.AGM_EXTENSION) && isAuthorized(AuthorizedActionsE.AGM_EXTENSION_FILING)
      }

      case AllowableActionE.AGM_LOCATION_CHANGE: {
        return isAllowedToFile(FilingTypes.AGM_LOCATION_CHANGE) &&
               isAuthorized(AuthorizedActionsE.AGM_CHG_LOCATION_FILING)
      }

      case AllowableActionE.AMALGAMATION: {
        return isAllowedToFile(FilingTypes.AMALGAMATION_APPLICATION) &&
               isAuthorized(AuthorizedActionsE.AMALGAMATION_FILING)
      }

      case AllowableActionE.AMALGAMATION_OUT: {
        return isAllowedToFile(FilingTypes.AMALGAMATION_OUT) && isAuthorized(AuthorizedActionsE.STAFF_FILINGS)
      }

      case AllowableActionE.ANNUAL_REPORT: {
        return isAllowedToFile(FilingTypes.ANNUAL_REPORT) && isAuthorized(AuthorizedActionsE.ANNUAL_REPORT_FILING)
      }

      case AllowableActionE.BUSINESS_INFORMATION: {
        if (isLegalType([CorpTypeCd.COOP])) {
          // NB: this feature is targeted via LaunchDarkly
          const ff = !!getFeatureFlag('special-resolution-ui-enabled')
          return (ff && isAllowedToFile(FilingTypes.SPECIAL_RESOLUTION) &&
                 isAuthorized(AuthorizedActionsE.SPECIAL_RESOLUTION_FILING))
        }
        if (isEntityFirm()) {
          return isAllowedToFile(FilingTypes.CHANGE_OF_REGISTRATION) &&
                 isAuthorized(AuthorizedActionsE.FIRM_CHANGE_FILING)
        }
        return isAllowedToFile(FilingTypes.ALTERATION) && isAuthorized(AuthorizedActionsE.ALTERATION_FILING)
      }

      case AllowableActionE.BUSINESS_SUMMARY: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!getFeatureFlag('supported-business-summary-entities')?.includes(legalType)
        return (ff && isBusiness)
      }

      case AllowableActionE.CONSENT_AMALGAMATION_OUT: {
        return isAllowedToFile(FilingTypes.CONSENT_AMALGAMATION_OUT)
      }

      case AllowableActionE.CONSENT_CONTINUATION_OUT: {
        return isAllowedToFile(FilingTypes.CONSENT_CONTINUATION_OUT) &&
               isAuthorized(AuthorizedActionsE.CONSENT_CONTINUATION_OUT_FILING)
      }

      case AllowableActionE.CONTINUATION_OUT: {
        return isAllowedToFile(FilingTypes.CONTINUATION_OUT) && isAuthorized(AuthorizedActionsE.STAFF_FILINGS)
      }

      case AllowableActionE.CORRECTION: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!getFeatureFlag('supported-correction-entities')?.includes(legalType)
        return (ff && isAllowedToFile(FilingTypes.CORRECTION)) && isAuthorized(AuthorizedActionsE.CORRECTION_FILING)
      }

      case AllowableActionE.COURT_ORDER: {
        return isAllowedToFile(FilingTypes.COURT_ORDER) && isAuthorized(AuthorizedActionsE.COURT_ORDER_FILING)
      }

      /**
       * DBC feature is only available to self-registered owners of an SP
       * who are logged in via BCSC.
       */
      case AllowableActionE.DIGITAL_CREDENTIALS: {
        // NB: this feature is targeted via LaunchDarkly
        const ff = !!getFeatureFlag('enable-digital-credentials')
        const isDigitalBusinessCardAllowed = currentBusiness.value.allowedActions.digitalBusinessCard
        return (ff && isDigitalBusinessCardAllowed && isAuthorized(AuthorizedActionsE.DIGITAL_CREDENTIALS))
      }

      case AllowableActionE.DIRECTOR_CHANGE: {
        if (isEntityFirm()) {
          return isAllowedToFile(FilingTypes.CHANGE_OF_REGISTRATION) &&
                 isAuthorized(AuthorizedActionsE.FIRM_CHANGE_FILING)
        }
        return isAllowedToFile(FilingTypes.CHANGE_OF_DIRECTORS) &&
               isAuthorized(AuthorizedActionsE.DIRECTOR_CHANGE_FILING)
      }

      case AllowableActionE.FREEZE_UNFREEZE: {
        // this covers both Freeze and Unfreeze
        return isAllowedToFile(FilingTypes.ADMIN_FREEZE) && isAuthorized(AuthorizedActionsE.STAFF_FILINGS)
      }

      case AllowableActionE.LIMITED_RESTORATION_EXTENSION: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!getFeatureFlag('supported-restoration-entities')?.includes(legalType)
        return (ff && isAllowedToFile(FilingTypes.RESTORATION, FilingSubTypeE.LIMITED_RESTORATION_EXTENSION) &&
                isAuthorized(AuthorizedActionsE.RESTORATION_REINSTATEMENT_FILING))
      }

      case AllowableActionE.LIMITED_RESTORATION_TO_FULL: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!getFeatureFlag('supported-restoration-entities')?.includes(legalType)
        return (ff && isAllowedToFile(FilingTypes.RESTORATION, FilingSubTypeE.LIMITED_RESTORATION_TO_FULL) &&
                isAuthorized(AuthorizedActionsE.RESTORATION_REINSTATEMENT_FILING))
      }

      case AllowableActionE.PUT_BACK_ON: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!getFeatureFlag('supported-put-back-on-entities')?.includes(legalType)
        return (ff && isAllowedToFile(FilingTypes.PUT_BACK_ON)) && isAuthorized(AuthorizedActionsE.STAFF_FILINGS)
      }

      case AllowableActionE.RECORD_CONVERSION: {
        return isAllowedToFile(FilingTypes.CONVERSION) && isAuthorized(AuthorizedActionsE.FIRM_CONVERSION_FILING)
      }

      case AllowableActionE.REGISTRARS_NOTATION: {
        return isAllowedToFile(FilingTypes.REGISTRARS_NOTATION) && isAuthorized(AuthorizedActionsE.STAFF_FILINGS)
      }

      case AllowableActionE.REGISTRARS_ORDER: {
        return isAllowedToFile(FilingTypes.REGISTRARS_ORDER) && isAuthorized(AuthorizedActionsE.STAFF_FILINGS)
      }

      case AllowableActionE.RESTORATION: {
        // NB: specific entities are targeted via LaunchDarkly
        // NB: this applies to full restoration or limited restoration
        // but not limited restoration extension or limited restoration to full
        const ff = !!getFeatureFlag('supported-restoration-entities')?.includes(legalType)
        return (
          ff &&
          (
            isAllowedToFile(FilingTypes.RESTORATION, FilingSubTypeE.FULL_RESTORATION) ||
            isAllowedToFile(FilingTypes.RESTORATION, FilingSubTypeE.LIMITED_RESTORATION)
          ) &&
          isAuthorized(AuthorizedActionsE.RESTORATION_REINSTATEMENT_FILING)
        )
      }

      case AllowableActionE.TRANSITION: {
        return isAllowedToFile(FilingTypes.TRANSITION) && isAuthorized(AuthorizedActionsE.TRANSITION_FILING)
      }

      case AllowableActionE.VOLUNTARY_DISSOLUTION: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!getFeatureFlag('supported-dissolution-entities')?.includes(legalType)
        return (ff && isAllowedToFile(FilingTypes.DISSOLUTION, FilingSubTypeE.DISSOLUTION_VOLUNTARY) &&
                isAuthorized(AuthorizedActionsE.VOLUNTARY_DISSOLUTION_FILING))
      }

      default:
        return false // should never happen
    }
  }

  return {
    isButtonForActionVisible: isAllowedToFile,
    isActionVisible
  }
})
