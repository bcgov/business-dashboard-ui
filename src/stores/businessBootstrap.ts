import { StatusCodes } from 'http-status-codes'
import { FilingTypes } from '@bcrs-shared-components/enums'
import {
  CorpTypeCd, GetCorpFullDescription, GetCorpNumberedDescription
} from '@bcrs-shared-components/corp-type-module'
import { filingTypeToName } from '~/utils/todo/task-filing/helper'
import type { PendingItemI } from '~/interfaces/pending-item-i'

/** Manages bcros bootstrap business (temp reg) data */
export const useBcrosBusinessBootstrap = defineStore('bcros/businessBootstrap', () => {
  const bootstrapFiling: Ref<BootstrapFilingApiResponseI> = ref(undefined)
  const isStoreLoading = ref(false)
  const pendingFilings: Ref<PendingItemI[]> = ref([])
  const bootstrapIdentifier = computed(() => bootstrapFiling.value?.filing.business.identifier)
  const bootstrapLegalType = computed(() => bootstrapFiling.value?.filing.business.legalType)
  const bootstrapFilingType = computed(() => bootstrapFiling.value?.filing.header.name)
  const bootstrapFilingStatus = computed(() => bootstrapFiling.value?.filing.header.status)

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
    return `${GetCorpFullDescription(bootstrapLegalType.value)}${extraDesc}${filingName}`
  })

  const isAmalgamationTodo = computed(() =>
    bootstrapFilingType.value === FilingTypes.AMALGAMATION_APPLICATION &&
    (
      bootstrapFilingStatus.value === FilingStatusE.DRAFT ||
      bootstrapFilingStatus.value === FilingStatusE.NEW
    )
  )
  const isAmalgamationFiling = computed(() =>
    bootstrapFilingType.value === FilingTypes.AMALGAMATION_APPLICATION &&
    (
      bootstrapFilingStatus.value === FilingStatusE.CANCELLED ||
      bootstrapFilingStatus.value === FilingStatusE.PAID
    )
  )
  const isContinuationInTodo = computed(() =>
    bootstrapFilingType.value === FilingTypes.CONTINUATION_IN &&
    (
      bootstrapFilingStatus.value === FilingStatusE.CHANGE_REQUESTED ||
      bootstrapFilingStatus.value === FilingStatusE.DRAFT ||
      bootstrapFilingStatus.value === FilingStatusE.PENDING ||
      bootstrapFilingStatus.value === FilingStatusE.APPROVED
    )
  )
  const isContinuationInPending = computed(() =>
    bootstrapFilingType.value === FilingTypes.CONTINUATION_IN &&
    bootstrapFilingStatus.value === FilingStatusE.AWAITING_REVIEW
  )
  const isContinuationInFiling = computed(() =>
    bootstrapFilingType.value === FilingTypes.CONTINUATION_IN &&
    (
      bootstrapFilingStatus.value === FilingStatusE.COMPLETED ||
      bootstrapFilingStatus.value === FilingStatusE.PAID ||
      bootstrapFilingStatus.value === FilingStatusE.REJECTED
    )
  )
  const isIncorporationApplicationTodo = computed(() =>
    bootstrapFilingType.value === FilingTypes.INCORPORATION_APPLICATION &&
    (
      bootstrapFilingStatus.value === FilingStatusE.DRAFT ||
      bootstrapFilingStatus.value === FilingStatusE.PENDING
    )
  )
  const isIncorporationApplicationFiling = computed(() =>
    bootstrapFilingType.value === FilingTypes.INCORPORATION_APPLICATION &&
    (
      bootstrapFilingStatus.value === FilingStatusE.COMPLETED ||
      bootstrapFilingStatus.value === FilingStatusE.PAID
    )
  )
  const isRegistrationTodo = computed(() =>
    bootstrapFilingType.value === FilingTypes.REGISTRATION &&
    (
      bootstrapFilingStatus.value === FilingStatusE.DRAFT ||
      bootstrapFilingStatus.value === FilingStatusE.PENDING
    )
  )
  const isRegistrationFiling = computed(() =>
    bootstrapFilingType.value === FilingTypes.REGISTRATION &&
    (
      bootstrapFilingStatus.value === FilingStatusE.COMPLETED ||
      bootstrapFilingStatus.value === FilingStatusE.PAID
    )
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
    if (bootstrapNrNumber.value) {
      // get approved name from the linked name request
      return linkedNr.value?.names.find(val => val.state === NameRequestStateE.APPROVED)?.name
    } else {
      // return the numbered name description
      if (bootstrapFilingType.value === FilingTypes.AMALGAMATION_APPLICATION) {
        return 'Numbered Amalgamated Company'
      }
      return GetCorpNumberedDescription(bootstrapLegalType.value)
    }
  })

  const apiURL = useRuntimeConfig().public.legalApiURL
  const errors: Ref<ErrorI[]> = ref([])

  const tempRegIdRgx = /^T\w{9}$/
  const checkIsTempReg = (identifier: string) => tempRegIdRgx.test(identifier)

  const getBootstrapFiling = async (identifier: string, params?: object) => {
    return await useBcrosFetch<BootstrapFilingApiResponseI>(
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

        return data?.value
      })
  }

  const getNameRequest = async (nrNumber: string, params?: object) => {
    return await useBcrosFetch<NameRequestI>(
      `${apiURL}/nameRequests/${nrNumber}/validate`,
      { params, dedupe: 'defer' }
    )
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('Error fetching NR details for', nrNumber)
          errors.value.push({
            statusCode: error.value?.status || StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.value?.data?.message,
            category: ErrorCategoryE.ENTITY_BASIC
          })
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
      linkedNr.value = await getNameRequest(nrNumber)
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

    const bootsrapCached = bootstrapIdentifier.value === identifier
    if (!bootsrapCached || force) {
      isStoreLoading.value = true
      bootstrapFiling.value = await getBootstrapFiling(identifier)
      if (bootstrapNrNumber.value) {
        await loadLinkedNameRequest(bootstrapNrNumber.value)
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
