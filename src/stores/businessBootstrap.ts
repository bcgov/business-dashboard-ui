import { StatusCodes } from 'http-status-codes'
import { FilingTypes } from '@bcrs-shared-components/enums'
import {
  CorpTypeCd, GetCorpFullDescription, GetCorpNumberedDescription
} from '@bcrs-shared-components/corp-type-module'
import { filingTypeToName } from '~/utils/todo/task-filing/helper'

/** Manages bcros bootstrap business (temp reg) data */
export const useBcrosBusinessBootstrap = defineStore('bcros/businessBootstrap', () => {
  const bootstrapFiling: Ref<{ filing: BootstrapFilingI }> = ref(undefined)
  const isStoreLoading = ref(false)
  const bootstrapIdentifier = computed(() => bootstrapFiling.value?.filing.business.identifier)
  const bootstrapLegalType = computed(() => bootstrapFiling.value?.filing.business.legalType)
  const bootstrapFilingType = computed(() => bootstrapFiling.value?.filing.header.name)
  const bootstrapNrNumber = computed(() =>
    bootstrapFiling.value?.filing[bootstrapFilingType.value]?.nameRequest.nrNumber)
  const bootstrapFilingDisplayName = computed(() => {
    if (!bootstrapFiling.value) {
      return undefined
    }
    const filingName = filingTypeToName(
      bootstrapFilingType.value,
      undefined,
      bootstrapFiling.value.filing[bootstrapFilingType.value].type)

    if (bootstrapFilingType.value === FilingTypes.AMALGAMATION_APPLICATION) {
      return filingName
    }
    const extraDesc = bootstrapLegalType.value === CorpTypeCd.SOLE_PROP
      ? ` / ${useNuxtApp().$i18n.t('label.business.doingBusinessAs')} `
      : ' '
    return `${GetCorpFullDescription(bootstrapLegalType.value)}${extraDesc}${filingName}`
  })

  const linkedNr: Ref<NameRequestI> = ref(undefined)

  const bootstrapName = computed(() => {
    // TODO: #22685
    // seems there are cases where the NR information does not contain the nr number
    // i.e.T1BZVGOIY8
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
    return await useBcrosFetch<{ filing: BootstrapFilingI }>(
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
    if (!checkIsTempReg(identifier)) {
      // should never be here
      console.error(`Attempted to load ${identifier} as a bootstrap filing.`)
      return
    }

    console.debug('nr draft store stuff -- waiting for store flag')
    const storeIsLoading = new Promise((resolve) => {
      watch(isStoreLoading, (newValue) => {
        if (newValue == false) { // check the condition
          resolve(true);
        }
      }, { immediate: true });
    })

    await storeIsLoading
    console.debug('nr draft store stuff -- identifiers', bootstrapIdentifier.value, identifier)
    const bootsrapCached = bootstrapIdentifier.value === identifier
    if (!bootsrapCached || force) {
      isStoreLoading.value = true
      console.debug('nr draft store stuff -- should start loading')
      bootstrapFiling.value = await getBootstrapFiling(identifier)
      if (bootstrapNrNumber.value) {
        await loadLinkedNameRequest(bootstrapNrNumber.value)
      }
      isStoreLoading.value = false
    }
    console.debug('nr draft store stuff -- done and done')
    return
  }

  return {
    isStoreLoading,
    bootstrapFiling,
    bootstrapFilingDisplayName,
    bootstrapFilingType,
    bootstrapIdentifier,
    bootstrapLegalType,
    bootstrapName,
    bootstrapNrNumber,
    linkedNr,
    checkIsTempReg,
    loadBusinessBootstrap
  }
})
