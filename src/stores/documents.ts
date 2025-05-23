import type { ApiResponseOrError, DocumentRequestIF } from '~/interfaces/document-request-i'
import { AuthorizedActionsE } from '@/enums/authorized-actions-e'
import { isAuthorized } from '@/utils/authorizations'

/** Store for managing client documents  */
export const useBcrosDocuments = defineStore('bcros/documents', () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.docApiURL
  const docApiKey = config.public.docApiKey

  /** Array of Document objects returned from the DRS API */
  const documents = ref([] as Array<DocumentIF>)

  /** Returns True if the user is a staff account and the document records feature flag is enabled */
  const enableDocumentRecords = computed(() => isAuthorized(AuthorizedActionsE.ENABLE_DOCUMENT_RECORDS) &&
    !!useBcrosLaunchdarkly().getFeatureFlag('enable-document-records'))

  /**
   * Sends a GET request to fetch a document from the specified API endpoint (Document Record Service).
   *
   * @param params - The parameters for the document request, including document class, type, and consumer information.
   * @returns A promise that resolves to either an ApiResponseIF on success or an ApiErrorIF on failure.
  */
  const getCorpDocuments = async (params: DocumentRequestIF): Promise<ApiResponseOrError|void> => {
    const options = {
      method: 'GET',
      headers: { 'x-apikey': `${docApiKey}` }
    }

    const {
      pageNumber,
      consumerDocumentId,
      consumerReferenceId,
      consumerFilename,
      documentType,
      consumerIdentifier,
      queryStartDate,
      queryEndDate
    } = params

    // Construct query parameters
    const queryParams = new URLSearchParams()
    if (consumerDocumentId) { queryParams.append('consumerDocumentId', consumerDocumentId) }
    if (consumerIdentifier) { queryParams.append('consumerIdentifier', consumerIdentifier) }
    if (consumerReferenceId) { queryParams.append('consumerReferenceId', consumerReferenceId) }
    if (consumerFilename) { queryParams.append('consumerFilename', consumerFilename) }
    if (documentType) { queryParams.append('documentType', documentType) }
    if (queryStartDate) { queryParams.append('queryStartDate', queryStartDate) }
    if (queryEndDate) { queryParams.append('queryEndDate', queryEndDate) }
    if (pageNumber) { queryParams.append('pageNumber', pageNumber.toString()) }

    // Build the full URL
    const url = `${baseURL}/searches/CORP?${queryParams.toString()}`

    return await useBcrosFetch<ApiResponseIF>(url, options).then(({ data, error }) => {
      if (error.value || !data.value) {
        console.warn('Error fetching documents for', consumerIdentifier)
      }
      documents.value = data.value as unknown as DocumentIF[]
    }).catch((error) => {
      console.error('Failed to load the document records.', error)
    })
  }

  /**
   * Retrieves the consumerDocumentId of a document that matches the given filingId.
   *
   * @param documents - An array of Document objects to search through.
   * @param filingId - The filingId to match against the consumerReferenceId.
   * @returns The consumerDocumentId of the matching document, or undefined if no match is found.
  */
  const getDocIdByFilingId = (documents: DocumentIF[], filingId: number): string | undefined => {
    const document = documents?.find(doc =>
      doc.consumerReferenceId === filingId.toString())
    return document?.consumerDocumentId
  }

  return {
    documents,
    enableDocumentRecords,
    getCorpDocuments,
    getDocIdByFilingId
  }
})
