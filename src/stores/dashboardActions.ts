import { CorpTypeCd, FilingTypes } from '@bcrs-shared-components/enums'
import { FilingSubTypeE } from '~/enums/filing-sub-type-e'

/** Manages bcros account data */
export const useBcrosDashboardActions = defineStore('bcros/dashboardActions', () => {
  const visibleActions: Ref<FilingTypeI[]> = ref([])
  const _legalApiURL = useRuntimeConfig().public.legalApiURL
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

    return await useBcrosFetch<CouldFileI>(`${_legalApiURL}/businesses/allowable/${businessType}/${businessStatus}`, {})
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
      fetchVisibleActions(value.split('|')[0], value.split('|')[1]).then(data => {
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
    console.log('bstore', businessStore.currentBusiness)
    const currentBusiness = businessStore.currentBusiness

    const isEntityFirm = businessStore.isEntityFirm
    const isLegalType = businessStore.isLegalType
    const isBusiness = !!currentBusiness.value?.identifier

    const { isStaffAccount } = useBcrosAccount()
    const { getFeatureFlag } = useBcrosLaunchdarkly()
    const legalType = currentBusiness.legalType

    switch (action) {
      case AllowableActionE.ADDRESS_CHANGE: {
        if (isEntityFirm()) {
          return isAllowedToFile(FilingTypes.CHANGE_OF_REGISTRATION)
        }
        return isAllowedToFile(FilingTypes.CHANGE_OF_ADDRESS)
      }

      case AllowableActionE.ADMINISTRATIVE_DISSOLUTION: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!getFeatureFlag('supported-dissolution-entities')?.includes(legalType)
        return (ff && isAllowedToFile(FilingTypes.DISSOLUTION, FilingSubTypeE.DISSOLUTION_ADMINISTRATIVE))
      }

      case AllowableActionE.AGM_EXTENSION: {
        return isAllowedToFile(FilingTypes.AGM_EXTENSION)
      }

      case AllowableActionE.AGM_LOCATION_CHANGE: {
        return isAllowedToFile(FilingTypes.AGM_LOCATION_CHANGE)
      }

      case AllowableActionE.AMALGAMATION: {
        return isAllowedToFile(FilingTypes.AMALGAMATION_APPLICATION)
      }

      case AllowableActionE.AMALGAMATION_OUT: {
        return isAllowedToFile(FilingTypes.AMALGAMATION_OUT)
      }

      case AllowableActionE.ANNUAL_REPORT: {
        return isAllowedToFile(FilingTypes.ANNUAL_REPORT)
      }

      case AllowableActionE.BUSINESS_INFORMATION: {
        if (isLegalType([CorpTypeCd.COOP])) {
          // NB: this feature is targeted via LaunchDarkly
          const ff = !!getFeatureFlag('special-resolution-ui-enabled')
          return (ff && isAllowedToFile(FilingTypes.SPECIAL_RESOLUTION))
        }
        if (isEntityFirm()) {
          return isAllowedToFile(FilingTypes.CHANGE_OF_REGISTRATION)
        }
        return isAllowedToFile(FilingTypes.ALTERATION)
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
        return isAllowedToFile(FilingTypes.CONSENT_CONTINUATION_OUT)
      }

      case AllowableActionE.CONTINUATION_OUT: {
        return isAllowedToFile(FilingTypes.CONTINUATION_OUT)
      }

      case AllowableActionE.CORRECTION: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!getFeatureFlag('supported-correction-entities')?.includes(legalType)
        return (ff && isAllowedToFile(FilingTypes.CORRECTION))
      }

      case AllowableActionE.COURT_ORDER: {
        return isAllowedToFile(FilingTypes.COURT_ORDER)
      }

      case AllowableActionE.DETAIL_COMMENT: {
        return (isBusiness && isStaffAccount)
      }

      /**
       * DBC feature is only available to self-registered owners of an SP
       * who are logged in via BCSC.
       */
      case AllowableActionE.DIGITAL_CREDENTIALS: {
        // NB: this feature is targeted via LaunchDarkly
        const ff = !!getFeatureFlag('enable-digital-credentials')
        const isDigitalBusinessCardAllowed = currentBusiness.value.allowedActions.digitalBusinessCard
        return (ff && isDigitalBusinessCardAllowed)
      }

      case AllowableActionE.DIRECTOR_CHANGE: {
        if (isEntityFirm()) {
          return isAllowedToFile(FilingTypes.CHANGE_OF_REGISTRATION)
        }
        return isAllowedToFile(FilingTypes.CHANGE_OF_DIRECTORS)
      }

      case AllowableActionE.FREEZE_UNFREEZE: {
        // this covers both Freeze and Unfreeze
        return isAllowedToFile(FilingTypes.ADMIN_FREEZE)
      }

      case AllowableActionE.LIMITED_RESTORATION_EXTENSION: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!getFeatureFlag('supported-restoration-entities')?.includes(legalType)
        return (ff && isAllowedToFile(FilingTypes.RESTORATION, FilingSubTypeE.LIMITED_RESTORATION_EXTENSION))
      }

      case AllowableActionE.LIMITED_RESTORATION_TO_FULL: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!getFeatureFlag('supported-restoration-entities')?.includes(legalType)
        return (ff && isAllowedToFile(FilingTypes.RESTORATION, FilingSubTypeE.LIMITED_RESTORATION_TO_FULL))
      }

      case AllowableActionE.PUT_BACK_ON: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!getFeatureFlag('supported-put-back-on-entities')?.includes(legalType)
        return (ff && isAllowedToFile(FilingTypes.PUT_BACK_ON))
      }

      case AllowableActionE.RECORD_CONVERSION: {
        return isAllowedToFile(FilingTypes.CONVERSION)
      }

      case AllowableActionE.REGISTRARS_NOTATION: {
        return isAllowedToFile(FilingTypes.REGISTRARS_NOTATION)
      }

      case AllowableActionE.REGISTRARS_ORDER: {
        return isAllowedToFile(FilingTypes.REGISTRARS_ORDER)
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
          )
        )
      }

      case AllowableActionE.STAFF_COMMENT: {
        return (isBusiness && isStaffAccount)
      }

      case AllowableActionE.TRANSITION: {
        return isAllowedToFile(FilingTypes.TRANSITION)
      }

      case AllowableActionE.VOLUNTARY_DISSOLUTION: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!getFeatureFlag('supported-dissolution-entities')?.includes(legalType)
        return (ff && isAllowedToFile(FilingTypes.DISSOLUTION, FilingSubTypeE.DISSOLUTION_VOLUNTARY))
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
