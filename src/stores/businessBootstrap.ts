import { StatusCodes } from 'http-status-codes'
import { FilingTypes } from '@bcrs-shared-components/enums'
import {
  CorpTypeCd, GetCorpFullDescription, GetCorpNumberedDescription
} from '@bcrs-shared-components/corp-type-module'
import { useBcrosLegalApi } from '~/composables/useBcrosLegalApi'
import type { PendingItemI } from '~/interfaces/pending-item-i'

const filingTypeToName = useFilingTypeToName().filingTypeToName
/** Manages bcros bootstrap business (temp reg) data */
export const useBcrosBusinessBootstrap = defineStore('bcros/businessBootstrap', () => {
  const bootstrapFiling: Ref<BootstrapFilingApiResponseI> = ref(undefined)
  const isStoreLoading = ref(false)
  const pendingFilings: Ref<PendingItemI[]> = ref([])

  const nameRequestInvalid = ref(false)
  const nameRequestInvalidType: Ref<NameRequestStateE> = ref(null)

  const bootstrapIdentifier = computed(() => bootstrapFiling.value?.filing.business.identifier)
  const bootstrapLegalType = computed(() => {
    return bootstrapFiling.value?.filing.business.legalType ||
      bootstrapFiling.value?.filing?.incorporationApplication?.nameRequest?.legalType
  })
  const bootstrapFilingType = computed(() => bootstrapFiling.value?.filing.header.name)
  const bootstrapFilingStatus = computed(() => bootstrapFiling.value?.filing.header.status)
  const bootstrapNr = computed(() => bootstrapFiling.value?.filing[bootstrapFilingType.value]?.nameRequest)
  const bootstrapNrNumber = computed(() =>
    bootstrapFiling.value?.filing[bootstrapFilingType.value]?.nameRequest.nrNumber)
  const bootstrapFilingDisplayName = computed(() => {
    if (!bootstrapFiling.value) {
      return undefined
    }
    const filingName = filingTypeToName(
      bootstrapFilingType.value,
      undefined,
      bootstrapFiling.value.filing[bootstrapFilingType.value].type,
      bootstrapFilingStatus.value
    )

    if (bootstrapFilingType.value === FilingTypes.AMALGAMATION_APPLICATION) {
      return filingName
    }
    const extraDesc = bootstrapLegalType.value === CorpTypeCd.SOLE_PROP
      ? ` / ${useNuxtApp().$i18n.t('label.business.doingBusinessAs')} `
      : ' '
    return `${GetCorpFullDescription(bootstrapLegalType.value as CorpTypeCd)}${extraDesc}${filingName}`
  })

  const isAmalgamationTodo = computed(() =>
    bootstrapFilingType.value === FilingTypes.AMALGAMATION_APPLICATION &&
      [FilingStatusE.DRAFT, FilingStatusE.PENDING].includes(bootstrapFilingStatus.value)
  )
  const isAmalgamationFiling = computed(() =>
    bootstrapFilingType.value === FilingTypes.AMALGAMATION_APPLICATION &&
      [FilingStatusE.CANCELLED, FilingStatusE.COMPLETED, FilingStatusE.PAID, FilingStatusE.WITHDRAWN]
        .includes(bootstrapFilingStatus.value)
  )
  const isContinuationInTodo = computed(() =>
    bootstrapFilingType.value === FilingTypes.CONTINUATION_IN &&
      [FilingStatusE.DRAFT, FilingStatusE.PENDING, FilingStatusE.CHANGE_REQUESTED, FilingStatusE.APPROVED]
        .includes(bootstrapFilingStatus.value)
  )
  const isContinuationInPending = computed(() =>
    bootstrapFilingType.value === FilingTypes.CONTINUATION_IN &&
    bootstrapFilingStatus.value === FilingStatusE.AWAITING_REVIEW
  )
  const isContinuationInFiling = computed(() =>
    bootstrapFilingType.value === FilingTypes.CONTINUATION_IN &&
     [FilingStatusE.COMPLETED, FilingStatusE.PAID, FilingStatusE.REJECTED, FilingStatusE.WITHDRAWN]
       .includes(bootstrapFilingStatus.value)
  )

  const isIncorporationApplicationTodo = computed(() =>
    bootstrapFilingType.value === FilingTypes.INCORPORATION_APPLICATION &&
      [FilingStatusE.DRAFT, FilingStatusE.PENDING].includes(bootstrapFilingStatus.value)
  )
  const isIncorporationApplicationFiling = computed(() =>
    bootstrapFilingType.value === FilingTypes.INCORPORATION_APPLICATION &&
      [FilingStatusE.COMPLETED, FilingStatusE.PAID, FilingStatusE.WITHDRAWN].includes(bootstrapFilingStatus.value)
  )
  const isRegistrationTodo = computed(() =>
    bootstrapFilingType.value === FilingTypes.REGISTRATION &&
      [FilingStatusE.DRAFT, FilingStatusE.PENDING].includes(bootstrapFilingStatus.value)
  )
  const isRegistrationFiling = computed(() =>
    bootstrapFilingType.value === FilingTypes.REGISTRATION &&
      [FilingStatusE.COMPLETED, FilingStatusE.PAID, FilingStatusE.WITHDRAWN].includes(bootstrapFilingStatus.value)
  )

  const isBootstrapTodo = computed(() =>
    isAmalgamationTodo.value ||
    isContinuationInTodo.value ||
    isIncorporationApplicationTodo.value ||
    isRegistrationTodo.value
  )

  const isBootstrapPending = computed(() =>
    isContinuationInPending.value
  )

  const isBootstrapFiling = computed(() =>
    isAmalgamationFiling.value ||
    isContinuationInFiling.value ||
    isIncorporationApplicationFiling.value ||
    isRegistrationFiling.value
  )

  const linkedNr: Ref<NameRequestI> = ref(undefined)

  const bootstrapName = computed(() => {
    if (bootstrapNrNumber.value && (isBootstrapTodo.value || isBootstrapPending.value)) {
      // get approved name from the linked name request
      return linkedNr.value?.names.find(val => val.state === NameRequestStateE.APPROVED)?.name
    } else if (bootstrapNr?.value?.legalName) {
      return bootstrapNr.value.legalName
    } else {
      // return the numbered name description
      if (bootstrapFilingType.value === FilingTypes.AMALGAMATION_APPLICATION) {
        return 'Numbered Amalgamated Company'
      }
      return GetCorpNumberedDescription(bootstrapLegalType.value as CorpTypeCd)
    }
  })

  const errors: Ref<ErrorI[]> = ref([])

  const tempRegIdRgx = /^T\w{9}$/
  const checkIsTempReg = (identifier: string) => tempRegIdRgx.test(identifier)

  const getBootstrapFiling = async (identifier: string, params?: object) => {
    return await useBcrosLegalApi().fetch<BootstrapFilingApiResponseI>(
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

        return data?.value
      })
  }

  const getNameRequest = async (nrNumber: string, params?: object) => {
    return await useBcrosLegalApi().fetch<NameRequestI>(
      `/nameRequests/${nrNumber}/validate`,
      { params, dedupe: 'defer' }
    )
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('Error fetching NR details for', nrNumber)
          errors.value.push({
            statusCode: error.value?.status || StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.value?.data?.rootCause?.message,
            category: ErrorCategoryE.ENTITY_BASIC
          })

          // two cases where the NR is invalid
          if (error.value?.status === StatusCodes.BAD_REQUEST || error.value?.status === StatusCodes.FORBIDDEN) {
            nameRequestInvalid.value = true
          }
        }
        return data?.value
      })
  }

  const loadLinkedNameRequest = async (nrNumber: string, force = false) => {
    if (!nrNumber) {
      return
    }
    const nrCached = linkedNr.value?.nrNum === nrNumber
    if (!nrCached || force) {
      // reset name request error variables before fetching new data
      nameRequestInvalid.value = false
      nameRequestInvalidType.value = null

      const nameRequest = await getNameRequest(nrNumber)

      // check if the NR is invalid, or if the NR type does not match the entity type of this bootstrap filing
      if (isNrInvalid(nameRequest) || nameRequest.legalType !== bootstrapLegalType.value) {
        nameRequestInvalid.value = true
        return
      }

      // if IA is not yet completed, the NR should be consumable
      if (bootstrapFilingStatus.value !== FilingStatusE.COMPLETED) {
        const nrState = getNrState(nameRequest)
        if (nrState !== NameRequestStateE.APPROVED && nrState !== NameRequestStateE.CONDITIONAL) {
          nameRequestInvalid.value = true
          nameRequestInvalidType.value = nrState
          return
        }
      }

      linkedNr.value = nameRequest
    }
  }

  /** Load the bootstrap filing for the temporary identifier */
  const loadBusinessBootstrap = async (identifier: string, force = false) => {
    const { trackUiLoadingStart, trackUiLoadingStop } = useBcrosDashboardUi()
    trackUiLoadingStart('boostrapBusinessLoading')

    if (!checkIsTempReg(identifier)) {
      // should never be here
      console.error(`Attempted to load ${identifier} as a bootstrap filing.`)
      return
    }

    const bootstrapCached = bootstrapIdentifier.value === identifier
    if (!bootstrapCached || force) {
      isStoreLoading.value = true
      bootstrapFiling.value = await getBootstrapFiling(identifier)
      if (bootstrapNrNumber.value && (isBootstrapPending.value || isBootstrapTodo.value)) {
        await loadLinkedNameRequest(bootstrapNrNumber.value, force)
      }
      isStoreLoading.value = false
    }

    trackUiLoadingStop('boostrapBusinessLoading')
  }

  const loadPendingFiling = () => {
    const { trackUiLoadingStart, trackUiLoadingStop } = useBcrosDashboardUi()
    trackUiLoadingStart('boostrapPendingFilingLoading')

    if (bootstrapFiling.value && isBootstrapPending.value) {
      const name = isContinuationInPending.value ? 'continuation-in' : '' // for data-cy name
      const filingType = isContinuationInPending.value ? FilingTypes.CONTINUATION_IN : undefined

      const pendingFiling = {
        title: bootstrapFilingDisplayName.value,
        name,
        expandable: true,
        submitter: bootstrapFiling.value.filing.header.submitter,
        submittedDate: bootstrapFiling.value.filing.header.date,
        filingType
      } as PendingItemI

      pendingFilings.value = [pendingFiling]
    }

    trackUiLoadingStop('boostrapPendingFilingLoading')
  }

  return {
    bootstrapFiling,
    bootstrapFilingDisplayName,
    bootstrapFilingType,
    bootstrapIdentifier,
    nameRequestInvalid,
    nameRequestInvalidType,
    bootstrapLegalType,
    bootstrapName,
    bootstrapNrNumber,
    pendingFilings,
    linkedNr,
    isBootstrapTodo,
    isBootstrapPending,
    isBootstrapFiling,
    checkIsTempReg,
    loadBusinessBootstrap,
    loadPendingFiling
  }
})
