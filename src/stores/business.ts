import { StatusCodes } from 'http-status-codes'
import { CorpTypeCd, FilingTypes } from '@bcrs-shared-components/enums'
import type { CommentIF } from '@bcrs-shared-components/interfaces'
import type { BusinessI, StateFilingI } from '~/interfaces/business-i'
import { FilingSubTypeE } from '~/enums/filing-sub-type-e'
import { getBusinessConfig } from '~/utils/business-config'
import { useBcrosLegalApi } from '~/composables/useBcrosLegalApi'
import { LDFlags } from '~/enums/ld-flags'

/** Manages bcros business data */
export const useBcrosBusiness = defineStore('bcros/business', () => {
  const currentBusiness: Ref<BusinessI> = ref(undefined)
  const currentFolioNumber: Ref<string> = ref(undefined)
  const stateFiling: Ref<StateFilingI> = ref(undefined)
  const businessConfig: Ref<BusinessConfigI> = ref(undefined)
  const commentsLoading: Ref<boolean> = ref(false)
  const comments: Ref<CommentIF[]> = ref([])

  const currentBusinessAddresses: Ref<EntityAddressCollectionI> = ref(undefined)
  const currentParties: Ref<PartiesI> = ref(undefined)

  const currentBusinessIdentifier = computed((): string => currentBusiness.value?.identifier)
  const initialDateString = ref<Date | undefined>(undefined)
  // set BUSINESS_ID session storage when business identifier is loaded
  watch(currentBusinessIdentifier, (value) => {
    if (value) {
      sessionStorage.setItem('BUSINESS_ID', value)
    }
  }, { immediate: true })

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

  const isHistorical = computed((): boolean => currentBusiness.value?.state === BusinessStateE.HISTORICAL)

  const currentBusinessContact = ref({} as ContactBusinessI)
  // errors
  const errors: Ref<ErrorI[]> = ref([])
  // api request variables
  const authApiURL = useRuntimeConfig().public.authApiURL
  const launchdarklyStore = useBcrosLaunchdarkly()

  async function fetchBusinessComments (identifier: string) {
    commentsLoading.value = true
    comments.value = []
    return await useBcrosLegalApi().fetch<CommentIF>(`/businesses/${identifier}/comments`, {})
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('Error fetching comments for', identifier)
          return null
        }
        comments.value = data.value.comments.map(comment => comment.comment)
        commentsLoading.value = false
      })
  }

  /** Return the business details for the given identifier */
  async function getBusinessDetails (identifier: string, params?: object, slim: boolean = false) {
    return await useBcrosLegalApi().fetch<{ business: BusinessI }>(
      `/businesses/${identifier}${slim ? '?slim=true' : ''}`,
      { params, dedupe: 'defer' }
    )
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('Error fetching business details for', identifier)
          errors.value.push({
            statusCode: error.value?.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.value?.data?.message,
            category: ErrorCategoryE.ENTITY_BASIC
          })
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
            statusCode: error.value?.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
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
    return await useBcrosLegalApi().fetch<EntityAddressCollectionI>(
      `/businesses/${identifier}/addresses`, { params, dedupe: 'defer' })
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          // special case for missing business addresses
          if (error.value?.statusCode === StatusCodes.NOT_FOUND &&
            error.value?.data?.message?.includes('address not found')
          ) {
            return { businessOffice: null }
          }

          console.warn('Error fetching business addresses for', identifier)
          errors.value.push({
            statusCode: error.value?.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.value?.data?.message,
            category: ErrorCategoryE.ENTITY_BASIC
          })
        }

        return data.value
      })
  }

  async function getParties (identifier: string, params?: object) {
    return await useBcrosFetch<PartiesI>(
      `/businesses/${identifier}/parties`, { params, dedupe: 'defer' }
    )
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('Error fetching parties for', identifier)
          errors.value.push({
            statusCode: error.value?.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
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
            statusCode: error.value?.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.value?.data?.message,
            category: ErrorCategoryE.ENTITY_BASIC
          })
          return null
        }

        return data.value.filing
      })
  }

  async function loadBusiness(identifier: string, force = false) {
    const { trackUiLoadingStart, trackUiLoadingStop } = useBcrosDashboardUi()

    trackUiLoadingStart('businessInfoLoading')

    const businessCached = currentBusiness.value && identifier === currentBusinessIdentifier.value

    if (!businessCached || force) {
      fetchBusinessComments(identifier)
      currentBusiness.value = await getBusinessDetails(identifier) || {} as BusinessI

      // Converting lastModified values to Date objects
      const initialDate = apiToDate(currentBusiness.value.lastModified)
      initialDateString.value = initialDate

      if (currentBusiness.value.stateFiling) {
        await loadStateFiling()
      }

      businessConfig.value = getBusinessConfig(currentBusiness.value.legalType)
    }

    trackUiLoadingStop('businessInfoLoading')

    return { initialDateString }
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
    return currentBusiness?.value?.legalType === CorpTypeCd.SOLE_PROP ||
      currentBusiness?.value?.legalType === CorpTypeCd.PARTNERSHIP
  })

  // business statesFiling
  const isTypeRestorationFull = computed(() => {
    return stateFiling.value?.restoration?.type === FilingSubTypeE.FULL_RESTORATION
  })

  const isTypeRestorationLimited = computed(() => {
    return stateFiling.value?.restoration?.type === FilingSubTypeE.LIMITED_RESTORATION
  })

  const isTypeRestorationLimitedExtension = computed(() => {
    return stateFiling.value?.restoration?.type === FilingSubTypeE.LIMITED_RESTORATION_EXTENSION
  })

  const isInLimitedRestoration = computed(() => {
    return isTypeRestorationLimited.value || isTypeRestorationLimitedExtension.value
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
    const isBusiness = !!currentBusiness.value?.identifier

    const { getFeatureFlag } = useBcrosLaunchdarkly()
    const legalType = currentBusiness.value?.legalType

    switch (action) {
      case AllowableActionE.ADDRESS_CHANGE: {
        if (isEntityFirm()) {
          return isAllowedToFile(FilingTypes.CHANGE_OF_REGISTRATION)
        }
        return isAllowedToFile(FilingTypes.CHANGE_OF_ADDRESS)
      }

      case AllowableActionE.ADMINISTRATIVE_DISSOLUTION: {
        // NB: specific entities are targeted via LaunchDarkly
        const ff = !!getFeatureFlag(LDFlags.SupportDissolutionEntities)?.includes(legalType)
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
   * Is True for any business in the FF list, else False.
   * Used to apply special pre-go-live functionality.
   */
  function isDisableNonBenCorps (): boolean {
    // initially, this was True for all non-BEN corps (when FF was off)
    // now, this is True for the specified businesses only
    return currentBusiness?.value?.identifier && !!launchdarklyStore
      .getFeatureFlag('businesses-to-manage-in-colin')?.includes(currentBusiness.value.identifier)
  }

  /**
   * Creates a new comment
   * @param url the full URL to fetch the documents
   * @returns the fetch documents object or throws error
   */
  const postComment = async (businessId: string, comment: CreateCommentI) => {
    const url = `/businesses/${businessId}/comments`
    return await useBcrosFetch<{ comment: CommentIF }>(url, { method: 'POST', body: { comment } })
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('postComment() error - invalid response =', error?.value)
          throw new Error(error.value.message)
        }
        return data?.value
      })
  }
  const createCommentBusiness = async (comment: string): Promise<CommentIF> => {
    const account = useBcrosAccount()
    const accountId = account.currentAccount?.id || null
    if (accountId === null) {
      console.error('Unable to determine account id for filing comment')
      return
    }

    const commentObj: CreateCommentI = {
      comment,
      businessId: currentBusiness.value.identifier
    }
    // post comment to API
    const commentRes = await postComment(currentBusiness.value.identifier, commentObj)
    // flatten and sort the comments
    if (comments.value && comments.value.length > 0) {
      comments.value = [commentRes.comment, ...comments.value]
    } else {
      comments.value = [commentRes.comment]
    }
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
    isHistorical,
    errors,
    getBusinessAddress,
    getBusinessContact,
    getBusinessDetails,
    loadBusiness,
    loadBusinessContact,
    loadBusinessAddresses,
    loadParties,
    loadStateFiling,
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
    isAllowedToFile,
    isAllowed,
    createCommentBusiness,
    comments,
    commentsLoading,
    initialDateString
  }
})
