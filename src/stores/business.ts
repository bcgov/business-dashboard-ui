import { StatusCodes } from 'http-status-codes'

/** Manages bcros business data */
export const useBcrosBusiness = defineStore('bcros/business', () => {
  const currentBusiness: Ref<BusinessI> = ref({} as BusinessI)
  const currentFolioNumber: Ref<string> = ref('')
  const currentBusinessAddresses: Ref<EntityAddressCollectionI> = ref({} as EntityAddressCollectionI)
  const currentParties: Ref<PartiesI> = ref({} as PartiesI)
  const currentBusinessIdentifier = computed((): string => currentBusiness.value.identifier)
  const currentBusinessName = computed((): string => {
    if (currentBusiness.value.alternateNames && currentBusiness.value.legalType === BusinessTypeE.SOLE_PROP) {
      return currentBusiness.value.alternateNames[0].operatingName
    }
    return currentBusiness.value.legalName
  })
  const currentBusinessContact = ref({} as ContactBusinessI)
  // errors
  const errors: Ref<ErrorI[]> = ref([])
  // api request variables
  const apiURL = useRuntimeConfig().public.legalApiURL
  const authApiURL = useRuntimeConfig().public.authApiURL

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
        }
        return data.value.business
      })
  }

  /** Return the business contacts for the given identifier */
  async function getBusinessContact (identifier: string, params?: object) {
    // NOTE: this data will be moved to the legal-api eventually
    return await useBcrosFetch<ContactsBusinessResponseI>(`${authApiURL}/entities/${identifier}`, { params })
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('Error fetching business contacts for', identifier)
          errors.value.push({
            statusCode: error.value?.status || StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.value?.data?.message,
            category: ErrorCategoryE.ENTITY_BASIC
          })
        }
        if (data.value.contacts.length === 0) { return {} as ContactBusinessI }
        if (data.value.folioNumber) {
          currentFolioNumber.value = data.value.folioNumber
        }

        return {
          businessIdentifier: data.value.businessIdentifier,
          ...data.value.contacts[0]
        }
      })
  }

  async function getBusinessAddress (identifier: string, params?: object) {
    return await useBcrosFetch<EntityAddressCollectionI>(`${apiURL}/businesses/${identifier}/addresses`, { params })
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
    return await useBcrosFetch<PartiesI>(`${apiURL}/businesses/${identifier}/parties`, { params })
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

  async function loadBusiness (identifier: string, force = false) {
    const businessCached = currentBusiness.value && identifier === currentBusinessIdentifier.value
    if (!businessCached || force) {
      currentBusiness.value = await getBusinessDetails(identifier, { slim: true }) || {} as BusinessI
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
    const addressesCached = currentBusinessAddresses && identifier === currentBusinessIdentifier.value
    if (!addressesCached || force) {
      currentBusinessAddresses.value = await getBusinessAddress(identifier) || {} as EntityAddressCollectionI
    }
  }

  async function loadParties (identifier: string, force = false) {
    const partiesCached = currentParties && identifier === currentBusinessIdentifier.value
    if (!partiesCached || force) {
      currentParties.value = await getParties(identifier) || {} as PartiesI
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
    getBusinessAddress,
    getBusinessContact,
    getBusinessDetails,
    loadBusiness,
    loadBusinessContact,
    loadBusinessAddresses,
    loadParties
  }
})
