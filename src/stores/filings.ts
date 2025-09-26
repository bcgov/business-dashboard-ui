import { StatusCodes } from 'http-status-codes'
import { FilingTypes } from '@bcrs-shared-components/enums'
import { GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module'
import type { ApiResponseFilingI } from '~/interfaces/filing-i'
import type { FilingPayloadT } from '~/types/create-filing'
import { useBcrosLegalApi } from '~/composables/useBcrosLegalApi'

const filingTypeToName = useFilingTypeToName().filingTypeToName

export const useBcrosFilings = defineStore('bcros/filings', () => {
  const _filingsForIdentifier = ref('')
  const filings = ref([] as Array<ApiResponseFilingI>)
  const loading = ref(false)
  const errors = ref([])

  const { apiURL: legalApiURL } = useBcrosLegalApi().getConfig()

  const downloadingInProgress = ref(false)

  /** Whether the business is authorized to amalgamate out, i.e. true if cao expiry date is present or in the future. */
  const isAuthorizedToAmalgamateOut = computed(() => {
    const caoFiling = filings.value?.find((val) => {
      const exp = val.data?.consentAmalgamationOut?.expiry
      if (exp) {
        return true
      }
      return false
    })
    if (caoFiling) {
      const exp = caoFiling.data?.consentAmalgamationOut?.expiry
      const ccoExpiryDate = apiToDate(exp)
      return ccoExpiryDate >= new Date()
    }
    return false
  })

  /** Whether the business is authorized to continue out, i.e. true if cco expiry date is present or in the future. */
  const isAuthorizedToContinueOut = computed(() => {
    const ccoFiling = filings.value?.find((val) => {
      const exp = val.data?.consentContinuationOut?.expiry
      if (exp) {
        return true
      }
      return false
    })
    if (ccoFiling) {
      const exp = ccoFiling.data?.consentContinuationOut?.expiry
      const ccoExpiryDate = apiToDate(exp)
      return ccoExpiryDate >= new Date()
    }
    return false
  })

  const setDownloadingInProgress = (isDownloading: boolean) => {
    downloadingInProgress.value = isDownloading
  }

  /** Return the business details for the given identifier */
  async function getFilings (identifier: string, params?: object) {
    return await useBcrosLegalApi().fetch<{ filings: Array<ApiResponseFilingI> }>(
      `/businesses/${identifier}/filings`,
      { params, dedupe: 'defer' }
    )
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('Error fetching business details for', identifier)
          errors.value.push({
            statusCode: error.value?.status || StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.value?.data?.rootCause?.message,
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

  const createFiling = (business: BusinessI, filingType: FilingTypes, params: any, draft?: boolean): any => {
    const path = `/businesses/${business.identifier}/filings${draft ? '?draft=true' : ''}`
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
          startDate: business.startDate,
          foundingDate: business.foundingDate
        }
      }
    }

    payload.filing[filingType] = params

    return useBcrosLegalApi().fetch(path, { method: 'POST', body: JSON.stringify(payload) })
  }

  const loadBootstrapFiling = (bootstrapFiling: BootstrapFilingApiResponseI) => {
    const header = bootstrapFiling.filing.header
    const data = bootstrapFiling.filing[header.name]
    const status = header.status
    const description = GetCorpFullDescription(data.nameRequest.legalType)
    const filingName = filingTypeToName(header.name, null, data.type, status)
    const displayName = header.name === FilingTypes.AMALGAMATION_APPLICATION
      ? filingName
      : `${description} ${filingName}`
    const noticeOfWithdrawal = bootstrapFiling.filing.noticeOfWithdrawal?.filing || null

    filings.value = [{
      availableOnPaperOnly: header.availableOnPaperOnly,
      businessIdentifier: bootstrapFiling.filing.business.identifier,
      commentsCount: header.commentsCount || bootstrapFiling.commentsCount,
      commentsLink: header.commentsLink || bootstrapFiling.commentsLink,
      displayLedger: bootstrapFiling.displayLedger,
      displayName,
      documentsLink: header.documentsLink || bootstrapFiling.documentsLink,
      effectiveDate: apiToUtcString(header.effectiveDate),
      filingId: header.filingId,
      filingLink: header.filingLink || bootstrapFiling.filingLink,
      filingSubType: data.type,
      isFutureEffective: header.isFutureEffective,
      name: header.name,
      status: header.status,
      submittedDate: header.paymentDate || apiToUtcString(header.date),
      submitter: header.submitter,
      withdrawalPending: bootstrapFiling.withdrawalPending,
      data: {
        applicationDate: dateToYyyyMmDd(apiToDate(header.date)),
        legalFilings: [header.name],
        order: data.courtOrder,
        withdrawnDate: noticeOfWithdrawal?.header.effectiveDate || null
      },
      latestReviewComment: header.latestReviewComment
    } as ApiResponseFilingI]
    if (noticeOfWithdrawal) {
      const header = noticeOfWithdrawal.header
      const business = noticeOfWithdrawal.business
      const displayName = filingTypeToName(header.name, null, null, header.status)
      const filingLink = `${legalApiURL}/businesses/${business.identifier}/filings/${header.filingId}`
      const commentsLink = `${filingLink}/comments`
      const documentsLink = `${filingLink}/documents`

      // If the NoW is not in draft status, add it to the filings history list
      if (header.status !== FilingStatusE.DRAFT && header.status !== FilingStatusE.PENDING) {
        filings.value.unshift({
          availableOnPaperOnly: header.availableOnPaperOnly,
          businessIdentifier: business.identifier,
          commentsCount: header.comments?.length,
          commentsLink,
          displayLedger: bootstrapFiling.displayLedger,
          displayName,
          documentsLink,
          effectiveDate: apiToUtcString(header.effectiveDate),
          filingId: header.filingId,
          filingLink,
          isFutureEffective: false,
          name: header.name,
          status: header.status,
          submittedDate: header.paymentDate || apiToUtcString(header.date),
          submitter: header.submitter,
          data: {
            applicationDate: dateToYyyyMmDd(apiToDate(header.date)),
            legalFilings: [header.name],
            order: noticeOfWithdrawal.noticeOfWithdrawal.courtOrder
          },
          latestReviewComment: header.latestReviewComment
        } as ApiResponseFilingI)
      } else {
        useBcrosTodos().loadBootstrapTask({
          enabled: true,
          order: 0,
          task: { filing: noticeOfWithdrawal }
        } as TaskI)
      }
    }
  }

  return {
    filings,
    loading,
    errors,
    downloadingInProgress,
    isAuthorizedToAmalgamateOut,
    isAuthorizedToContinueOut,
    loadFilings,
    loadBootstrapFiling,
    clearFilings,
    getPendingCoa,
    createFiling,
    setDownloadingInProgress
  }
})
