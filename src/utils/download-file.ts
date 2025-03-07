/**
 * Add a new DocumentI to the filing documents list
 * @param filing
 * @param title
 * @param filename
 * @param link
 */
const pushDocument = (filing: ApiResponseFilingI, title: string, filename: string, link: string) => {
  if (title && filename && link) {
    filing.documents.push({ title, filename, link } as DocumentI)
  } else {
    console.error(`invalid document = ${title} | ${filename} | ${link}`)
  }
}

/**
 * Converts a string in "camelCase" (or "PascalCase") to a string of separate, title-case words,
 * suitable for a title or proper name.
 * @param s the string to convert
 * @returns the converted string
 */
const camelCaseToWords = (s: string): string => {
  const words = s?.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase()) || ''
  // SPECIAL CASE: convert 'Agm' to uppercase
  return words.replace('Agm', 'AGM')
}

/**
 * If the filing has documentsLink but the documents list is empty, load the documents list
 * @param filing the filing object
 */
export const loadDocumentList = async (filing: ApiResponseFilingI) => {
  const t = useNuxtApp().$i18n.t
  const unknownStr = `[${t('text.general.unknown')}]`
  const { currentBusinessIdentifier } = storeToRefs(useBcrosBusiness())

  if (!filing.documents && filing.documentsLink) {
    try {
      filing.documents = []
      const documentListObj = await fetchDocumentList(filing.documentsLink)
      const fetchedDocuments: FetchDocumentsI = documentListObj.documents || {}

      for (const groupName in fetchedDocuments) {
        if (groupName === 'legalFilings' && Array.isArray(fetchedDocuments.legalFilings)) {
          // iterate over legalFilings array
          for (const legalFilings of fetchedDocuments.legalFilings) {
            // iterate over legalFilings properties
            for (const legalFiling in legalFilings) {
              // this is a legal filing output
              let title: string
              // use display name for primary document's title
              if (legalFiling === filing.name) {
                title = filing.displayName
              } else {
                title = t(`filing.name.${legalFiling}`)
                if (title === `filing.name.${legalFiling}`) {
                  title = camelCaseToWords(legalFiling)
                }
              }
              const date = dateToYyyyMmDd(new Date(filing.submittedDate))
              const identifier = currentBusinessIdentifier.value || filing.businessIdentifier
              const filename = `${identifier} ${title} - ${date}.pdf`
              const link = legalFilings[legalFiling]
              pushDocument(filing, title, filename, link)
            }
          }
        } else if (groupName === 'staticDocuments' && Array.isArray(fetchedDocuments.staticDocuments)) {
          // iterate over staticDocuments array
          for (const document of fetchedDocuments.staticDocuments) {
            const title = document.name
            const filename = title
            const link = document.url
            pushDocument(filing, title, filename, link)
          }
        } else if (groupName === 'uploadedCourtOrder') {
          const fileNumber = filing.data?.order?.fileNumber || unknownStr
          const title = isCourtOrderType(filing) ? `${filing.displayName} ${fileNumber}` : `${filing.displayName}`
          const filename = title
          const link = fetchedDocuments[groupName] as string
          pushDocument(filing, title, filename, link)
        } else {
          // this is a submission level output
          const title = camelCaseToWords(groupName)
          const date = dateToYyyyMmDd(new Date(filing.submittedDate))
          const identifier = currentBusinessIdentifier.value || filing.businessIdentifier
          const filename = `${identifier} ${title} - ${date}.pdf`
          const link = fetchedDocuments[groupName] as string
          pushDocument(filing, title, filename, link)
        }
      }
    } catch (error) {
      // set property to null to retry next time
      filing.documents = null
      console.error('loadDocumentList() error =', error)
    }
  }
}

/**
 * Fetches documents object.
 * @param url the full URL to fetch the documents
 * @returns the fetch documents object
 */
export const fetchDocuments = async (url: string): Promise<Blob> => {
  return await useBcrosFetch<Blob>(url,
    { method: 'GET', headers: { Accept: 'application/pdf' }, responseType: 'blob' })
    .then(({ data, error }) => {
      if (error.value || !data.value) {
        console.warn('fetchDocuments() error - invalid response =', error?.value)
        throw new Error('Invalid documents')
      }
      return data?.value
    })
}

/** save data blob to computer */
export const saveBlob = (blob: any, fileName: string) => {
  if (window.navigator && window.navigator.msSaveOrOpenBlob) {
    window.navigator.msSaveOrOpenBlob(blob, fileName)
  } else {
    // for other browsers, create a link pointing to the ObjectURL containing the blob
    const url = window.URL.createObjectURL(blob)
    const a = window.document.createElement('a')
    window.document.body.appendChild(a)
    a.setAttribute('style', 'display: none')
    a.href = url
    a.download = fileName
    a.click()
    window.URL.revokeObjectURL(url)
    a.remove()
  }
}

/** Download the file as the given filename. */
export const downloadFile = async (document: DocumentI) => {
  try {
    const doc = await fetchDocuments(document.link)
    saveBlob(doc, document.filename)
  } catch (error) {
    console.error('file downloading error =', error)
    useBcrosDashboardUi().showDownloadingErrorDialog = true
  }
}
