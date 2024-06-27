/** A legal filing object from the API. */
export interface LegalFilingI {
  // contains one arbitrarily-named legal filing output
  // whose name is the filing type
  // eg, alteration, annualReport, etc
  [name: string]: string // link to fetch it
}

/** Response object from LegalServices.fetchDocuments(). */
export interface FetchDocumentsI {
  // contains any number of arbitrarily-named submission level outputs
  // or an array named "legalFilings"
  // eg, certificate, noticeOfArticles, receipt, etc
  [name: string]: string | LegalFilingI[] // link to fetch it, or array
}

/**
 * Fetches documents object.
 * @param url the full URL to fetch the documents
 * @returns the fetch documents object
 */
export const fetchDocuments = async (url: string): Promise<FetchDocumentsI> => {
  return await useBcrosFetch<{ documents: FetchDocumentsI }>(url, { method: 'GET'})
    .then(({ data, error }) => {
      if (error.value || !data.value) {
        console.log('fetchDocuments() error - invalid response =', error?.value)
        throw new Error('Invalid documents')
      }
      // todo: fixme ? does it download file ?
      return data?.value?.documents
    })
  //
  // return axios.get(url)
  //   .then(response => {
  //     const documents = response?.data?.documents
  //     if (!documents) {
  //       // eslint-disable-next-line no-console
  //       console.log('fetchDocuments() error - invalid response =', response)
  //       throw new Error('Invalid documents')
  //     }
  //     return documents
  //   })
}
