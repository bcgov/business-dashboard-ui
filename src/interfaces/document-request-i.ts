// Define a type for the document request parameters
export interface DocumentRequestIF {
  pageNumber?: number
  documentServiceId?: string
  consumerDocumentId?: string
  documentClass?: string
  documentType?: string
  description?: string
  consumerIdentifier?: string
  consumerFilingDate?: string
  consumerFilename?: string
  productCode?: string
  documentURL?: string
  queryStartDate?: string
  queryEndDate?: string
}

// Define a type for the document search RO
export interface DocumentIF {
  author: string
  consumerDocumentId: string
  consumerFilename: string
  consumerFilingDateTime: string
  consumerIdentifier: string
  consumerReferenceId?: string // Will map to filingId: Conditionally returned by the API
  createDateTime: string
  description: string
  documentClass: string
  documentServiceId: string
  documentType: string
  documentTypeDescription: string
  documentURL: string
}

// Define a type for the Axios response data
export interface ApiResponseIF<T = any> {
  data: T
  status: any
  statusText?: string
  statusCode?: number
}

// Define a type for the Axios error response
export interface ApiErrorIF {
  message: string
  status?: number
  statusText?: string
  statusCode?: number
}

export type ApiResponseOrError = ApiResponseIF | ApiErrorIF
