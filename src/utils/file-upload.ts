import * as pdfjs from 'pdfjs-dist/legacy/build/pdf'
import { useBcrosLegalApi } from '~/composables/useBcrosLegalApi'

/** Type of page size dictionary. */
type PageSizeDictionary = Record<PageSizeE, {
  pointsPerInch: number
  width: number
  height: number
  validationErrorMsg: string
}>

/** Dictionary of page sizes. */
export const PAGE_SIZE_DICT: PageSizeDictionary = {
  LETTER_PORTRAIT: {
    pointsPerInch: 72,
    width: 8.5,
    height: 11,
    validationErrorMsg: 'Document must be set to fit onto 8.5” x 11” letter-size paper'
  }
}

/**
 * Retrieves encryption and content lock info from PDF file.
 * Throws an exception on invalid PDF.
 * @param file the file to check
 * @return an object containing the file's info
 */
export const retrieveFileInfo = async (file: File): Promise<PdfInfoI> => {
  try {
    const pdfjsLib = pdfjs
    pdfjsLib.GlobalWorkerOptions.workerSrc = await import('pdfjs-dist/legacy/build/pdf.worker.entry')

    const arrayBuffer = await file.arrayBuffer()
    const data = new Uint8Array(arrayBuffer) // put it in a Uint8Array
    const document = await pdfjsLib.getDocument({ data }).promise
    const perms = await document.getPermissions()
    return { isEncrypted: false, isContentLocked: !!perms }
  } catch (err) {
    if (err.name === 'PasswordException') {
      return { isEncrypted: true, isContentLocked: true }
    }
    throw err // re-throw any other error
  }
}

/**
 * Checks whether PDF file is using specified page size by checking
 * width and height of all pages. Throws an exception on invalid PDF.
 * @param file the file to check
 * @param pageSize page size to check for
 * @return whether file is expected page size
 */
export const isPageSize = async (file: File, pageSize: PageSizeE): Promise<boolean> => {
  const pdfjsLib = pdfjs
  pdfjsLib.GlobalWorkerOptions.workerSrc = await import('pdfjs-dist/legacy/build/pdf.worker.entry')
  const pageSizeInfo = PAGE_SIZE_DICT[pageSize]
  const arrayBuffer = await file.arrayBuffer()
  const data = new Uint8Array(arrayBuffer) // put it in a Uint8Array
  const document = await pdfjsLib.getDocument({ data }).promise
  for (let pageNum = 1; pageNum <= document.numPages; pageNum++) {
    const page = await document.getPage(pageNum)
    const [x, y, w, h] = page._pageInfo.view
    const width = w - x
    const height = h - y
    const isValidPageSize =
      (width / pageSizeInfo.pointsPerInch === pageSizeInfo.width) &&
      (height / pageSizeInfo.pointsPerInch === pageSizeInfo.height)
    if (!isValidPageSize) { return false }
  }
  return true
}

/**
 * Gets a pre-signed URL for the specified filename.
 * @param filename the file name
 * @returns the presigned url object
 */
export const getPresignedUrl = async (fileName: string): Promise<PresignedUrlI> => {
  return await useBcrosLegalApi().fetch<PresignedUrlI>(
    `/documents/${fileName}/signatures`, { method: 'GET' }
  ).then(({ data, error }) => {
    if (error.value) {
      console.error('Error sending data:', error.value)
    }
    return data.value
  })
}

/**
 * Uploads the specified file to the specified URL.
 * @param url the URL to upload to
 * @param file the file to upload
 * @param key the file key
 * @param userId the file user id
 * @returns the response status
 */
export const uploadToUrl = async (url: string, file: File, key: string, userId: string): Promise<string> => {
  const headers = {
    'Content-Type': file.type,
    'x-amz-meta-userid': `${userId}`,
    'x-amz-meta-key': `${key}`,
    'Content-Disposition': `attachment; filename=${file.name}`
  }

  return await useFetch<any>(url, {
    method: 'PUT',
    headers,
    body: file
  }).then((response) => {
    return response.status.value
  })
}
