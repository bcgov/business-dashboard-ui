import { StatusCodes } from 'http-status-codes'
import { CorpTypeCd, FilingTypes } from '@bcrs-shared-components/enums'
import { getBusinessConfig } from '~/utils/business-config'

/** Manages bcros business data */
export const useBcrosBusiness = defineStore('bcros/business', () => {
  const currentBusiness: Ref<BusinessI> = ref(undefined)
  const currentFolioNumber: Ref<string> = ref(undefined)
  const stateFiling: Ref<StateFilingI> = ref(undefined)
  const businessConfig: Ref<BusinessConfigI> = ref(undefined)

  const currentBusinessAddresses: Ref<EntityAddressCollectionI> = ref(undefined)
  const currentParties: Ref<PartiesI> = ref(undefined)
  const currentBusinessIdentifier = computed((): string => currentBusiness.value?.identifier)
  const currentBusinessName = computed((): string => {
    if (!currentBusiness.value) {
      return undefined
    }
    const isSolePropOrGp = currentBusiness.value.legalType === CorpTypeCd.SOLE_PROP ||
      currentBusiness.value.legalType === CorpTypeCd.PARTNERSHIP

    if (currentBusiness.value.alternateNames && isSolePropOrGp) {
      const alternateName = currentBusiness.value.alternateNames
        .find(alternateName => alternateName.identifier === currentBusinessIdentifier.value)
      return alternateName?.name || currentBusiness.value.legalName
    }

    return currentBusiness.value.legalName
  })
  const currentBusinessContact = ref({} as ContactBusinessI)
  // errors
  const errors: Ref<ErrorI[]> = ref([])
  // api request variables
  const apiURL = useRuntimeConfig().public.legalApiURL
  const authApiURL = useRuntimeConfig().public.authApiURL
  const launchdarklyStore = useBcrosLaunchdarkly()

  /** Return the business details for the given identifier */
  async function getBusinessDetails (identifier: string, params?: object) {
    return await useBcrosFetch<{ business: BusinessI }>(
      `${apiURL}/businesses/${identifier}`,
      { params, dedupe: 'defer' }
    )
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('Error fetching business details for', identifier)
          errors.value.push({
            statusCode: error.value?.status || StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.value?.data?.message,
            category: ErrorCategoryE.ENTITY_BASIC
          })
          return null
        }
        return data.value?.business
      })
  }

  /** Return the business contacts for the given identifier */
  async function getBusinessContact (identifier: string, params?: object) {
    // NOTE: this data will be moved to the legal-api eventually
    return await useBcrosFetch<ContactsBusinessResponseI>(
      `${authApiURL}/entities/${identifier}`, { params, dedupe: 'defer' })
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('Error fetching business contacts for', identifier)
          errors.value.push({
            statusCode: error.value?.status || StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.value?.data?.message,
            category: ErrorCategoryE.ENTITY_BASIC
          })
        }

        if (!data?.value?.contacts?.length) {
          return {} as ContactBusinessI
        }

        if (data?.value?.folioNumber) {
          currentFolioNumber.value = data.value.folioNumber
        }

        return {
          businessIdentifier: data.value?.businessIdentifier,
          ...data.value.contacts[0]
        }
      })
  }

  async function getBusinessAddress (identifier: string, params?: object) {
    return await useBcrosFetch<EntityAddressCollectionI>(
      `${apiURL}/businesses/${identifier}/addresses`, { params, dedupe: 'defer' })
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('Error fetching business addresses for', identifier)
          errors.value.push({
            statusCode: error.value?.status || StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.value?.data?.message,
            category: ErrorCategoryE.ENTITY_BASIC
          })
        }

        return data.value
      })
  }

  async function getParties (identifier: string, params?: object) {
    return await useBcrosFetch<PartiesI>(`${apiURL}/businesses/${identifier}/parties`, { params, dedupe: 'defer' })
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('Error fetching parties for', identifier)
          errors.value.push({
            statusCode: error.value?.status || StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.value?.data?.message,
            category: ErrorCategoryE.ENTITY_BASIC
          })
        }

        return data.value
      })
  }

  async function getStateFiling (stateFilingUrl: string, params?: object): Promise<StateFilingI | null> {
    if (!stateFilingUrl) {
      return null
    }

    return await useBcrosFetch<{ filing: StateFilingI } | null>(stateFilingUrl, params)
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('Error fetching state filing')
          errors.value.push({
            statusCode: error.value?.status || StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.value?.data?.message,
            category: ErrorCategoryE.ENTITY_BASIC
          })
          return null
        }

        return data.value.filing
      })
  }

  async function loadBusiness (identifier: string, force = false) {
    const businessCached = currentBusiness.value && identifier === currentBusinessIdentifier.value
    if (!businessCached || force) {
      currentBusiness.value = await getBusinessDetails(identifier) || {} as BusinessI
      if (currentBusiness.value.stateFiling) {
        await loadStateFiling()
      }
      businessConfig.value = getBusinessConfig(currentBusiness.value.legalType)
    }
  }

  async function loadBusinessContact (identifier: string, force = false) {
    const contactCached = currentBusinessContact.value && identifier === currentBusinessContact.value.businessIdentifier
    await getBusinessAddress(identifier)
    if (!contactCached || force) {
      currentBusinessContact.value = await getBusinessContact(identifier) || {} as ContactBusinessI
    }
  }

  async function loadBusinessAddresses (identifier: string, force = false) {
    const addressesCached = currentBusinessAddresses.value && identifier === currentBusinessIdentifier.value
    if (!addressesCached || force) {
      currentBusinessAddresses.value = await getBusinessAddress(identifier) || {} as EntityAddressCollectionI
    }
  }

  async function loadParties (identifier: string, force = false) {
    const partiesCached = currentParties.value && identifier === currentBusinessIdentifier.value
    if (!partiesCached || force) {
      currentParties.value = await getParties(identifier) || {} as PartiesI
    }
  }

  async function loadStateFiling (force = false) {
    if (!stateFiling.value?.header || force) {
      stateFiling.value = await getStateFiling(currentBusiness.value.stateFiling)
    }
  }

  //
  const isFirm = computed(() => {
    return currentBusiness.value.legalType === CorpTypeCd.SOLE_PROP ||
      currentBusiness.value.legalType === CorpTypeCd.PARTNERSHIP
  })

  // business statesFiling
  const isTypeRestorationFull = computed(() => {
    return stateFiling.value?.restoration?.type === FilingSubTypeE.FULL_RESTORATION
  })

  const isTypeRestorationLimited = computed(() => {
    return stateFiling.value?.restoration?.type === FilingSubTypeE.LIMITED_RESTORATION
  })

  const isTypeRestorationLimitedExtension = computed(() => {
    return stateFiling.value?.restoration?.type === FilingSubTypeE.LIMITED_RESTORATION_TO_FULL
  })

  const isInLimitedRestoration = computed(() => {
    return isTypeRestorationLimited.value || isTypeRestorationLimitedExtension.value
  })

  const isAuthorizedToContinueOut = computed(() => {
    const expiryDate = stateFiling.value?.consentContinuationOut?.expiry
    if (expiryDate) {
      const ccoExpiryDate = new Date(expiryDate)
      return ccoExpiryDate >= new Date()
    }
    return false
  })

  const isAllowedToFile = (filingType: FilingTypes, filingSubType?: FilingSubTypeE) => {
    if (!filingType || !currentBusiness.value?.allowedActions?.filing) {
      return false
    }
    const requestedFiling = currentBusiness.value.allowedActions.filing.filingTypes
      .find(ft => ft.name === filingType && (filingSubType === undefined || ft.type === filingSubType))
    return !!requestedFiling
  }

  /** Check if the specified action is allowed, else False */
  const isAllowed = (action: AllowableActionE): boolean => {
    // const isBusiness = !!sessionStorage.getItem('BUSINESS_ID') // ie, not a temporary business

    // TO-DO: the above line is commented out because we do not have 'BUSINESS_ID' in the sessionStorage
    // For now, we check if the currentBusiness exists in the business store.
    const isBusiness = !!currentBusiness.value.identifier

    const { isStaffAccount } = useBcrosAccount()
    const { getFeatureFlag } = useBcrosLaunchdarkly()
    const legalType = currentBusiness.value.legalType

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

      default: return false // should never happen
    }
  }

  /** Whether the entity belongs to one of the passed-in legal types */
  function isLegalType (legalTypes: CorpTypeCd[]): boolean {
    return legalTypes.includes(currentBusiness.value?.legalType)
  }

  /** Whether the entity is a Sole Proprietorship or General Partnership. */
  function isEntityFirm (): boolean {
    return isLegalType([CorpTypeCd.SOLE_PROP, CorpTypeCd.PARTNERSHIP])
  }

  function isEntityCoop (): boolean {
    return isLegalType([CorpTypeCd.COOP])
  }

  /** Whether the entity is a base company (BC/BEN/CC/ULC or C/CBEN/CCC/CUL). */
  function isBaseCompany (): boolean {
    return isLegalType([
      CorpTypeCd.BC_COMPANY,
      CorpTypeCd.BENEFIT_COMPANY,
      CorpTypeCd.BC_CCC,
      CorpTypeCd.BC_ULC_COMPANY,
      CorpTypeCd.CONTINUE_IN,
      CorpTypeCd.BEN_CONTINUE_IN,
      CorpTypeCd.CCC_CONTINUE_IN,
      CorpTypeCd.ULC_CONTINUE_IN
    ])
  }

  /**
   * Is True for non-BEN corps if FF is disabled.
   * Is False for BENs and other entity types.
   * Used to apply special pre-go-live functionality.
   */
  function isDisableNonBenCorps (): boolean {
    if (
      isLegalType([CorpTypeCd.BC_COMPANY, CorpTypeCd.BC_CCC, CorpTypeCd.BC_ULC_COMPANY, CorpTypeCd.CONTINUE_IN,
        CorpTypeCd.CCC_CONTINUE_IN, CorpTypeCd.ULC_CONTINUE_IN
      ])
    ) {
      return !launchdarklyStore.getFeatureFlag('enable-non-ben-corps')
    }
    return false
  }

  return {
    currentBusiness,
    currentBusinessIdentifier,
    currentBusinessName,
    currentBusinessContact,
    currentFolioNumber,
    currentBusinessAddresses,
    currentParties,
    businessConfig,
    getBusinessAddress,
    getBusinessContact,
    getBusinessDetails,
    loadBusiness,
    loadBusinessContact,
    loadBusinessAddresses,
    loadParties,
    isEntityCoop,
    isLegalType,
    isEntityFirm,
    isBaseCompany,
    isDisableNonBenCorps,
    stateFiling,
    isInLimitedRestoration,
    isTypeRestorationLimitedExtension,
    isTypeRestorationLimited,
    isTypeRestorationFull,
    isFirm,
    isAuthorizedToContinueOut,
    isAllowedToFile,
    isAllowed
  }
})
