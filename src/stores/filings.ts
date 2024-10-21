import { StatusCodes } from 'http-status-codes'
import { FilingTypes } from '@bcrs-shared-components/enums'
import type { ApiResponseFilingI } from '~/interfaces/filing-i'
import type { FilingPayloadT } from '~/types/create-filing'

export const useBcrosFilings = defineStore('bcros/filings', () => {
  const _filingsForIdentifier = ref('')
  const filings = ref([] as Array<ApiResponseFilingI>)
  const loading = ref(false)
  const errors = ref([])

  const apiURL = useRuntimeConfig().public.legalApiURL

  /** Return the business details for the given identifier */
  async function getFilings (identifier: string, params?: object) {
    return await useBcrosFetch<{ filings: Array<ApiResponseFilingI> }>(
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

  const clearFilings = () => {
    filings.value = []
  }

  /** A pending COA filing, or undefined. */
  const getPendingCoa = () => {
    return filings.value.find((filing) => {
      return (
        useBcrosBusiness().isBaseCompany() &&
        isFilingType(filing, FilingTypes.CHANGE_OF_ADDRESS) &&
        filing.isFutureEffective &&
        isFilingStatus(filing, FilingStatusE.PAID) &&
        isDateFuture(filing.effectiveDate)
      )
    })
  }

  const createFiling = (business: BusinessI, filingType: FilingTypes, params: any, draft?: boolean) => {
    const url = `${apiURL}/businesses/${business.identifier}/filings${draft ? '?draft=true' : ''}`
    const currDate = new Date()
    const month = currDate.getMonth() + 1
    let monthStr = month + ''
    if (month < 10) {
      monthStr = '0' + month
    }
    const day = currDate.getDate()
    let dayStr = day + ''
    if (day < 10) {
      dayStr = '0' + day
    }

    const payload: FilingPayloadT = {
      filing: {
        header: {
          name: filingType,
          date: currDate.getFullYear() + '-' + monthStr + '-' + dayStr,
          certifiedBy: ''
        },
        business: {
          identifier: business.identifier,
          legalType: business.legalType,
          legalName: business.legalName,
          foundingDate: business.foundingDate
        }
      }
    }

    payload.filing[filingType] = params

    return useBcrosFetch(url, { method: 'POST', body: JSON.stringify(payload) })
  }

  return {
    filings,
    loading,
    errors,

    loadFilings,
    clearFilings,
    getPendingCoa,
    createFiling
  }
})
