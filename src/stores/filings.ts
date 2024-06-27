import { StatusCodes } from 'http-status-codes'

export const useBcrosFilings = defineStore('bcros/filings', () => {
  const _filingsForIdentifier = ref('')
  const filings = ref([])
  const loading = ref(false)
  const errors = ref([])

  const apiURL = useRuntimeConfig().public.legalApiURL

  /** Return the business details for the given identifier */
  async function getFilings (identifier: string, params?: object) {
    return await useBcrosFetch<{ filings: [] }>(
      `${apiURL}/businesses/${identifier}/filings`,
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
        return data?.value?.filings || []
      })
  }

  const loadFilings = async (identifier: string, force = false) => {
    const businessCached = filings.value && identifier === _filingsForIdentifier.value
    if (!businessCached || force) {
      filings.value = await getFilings(identifier)
    }
  }


  return {
    filings,
    loading,
    errors,

    loadFilings
  }
})
