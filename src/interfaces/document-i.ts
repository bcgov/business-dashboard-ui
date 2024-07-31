/** A document attached to a filing. */
export interface DocumentI {
  title: string // eg, "Certificate"
  filename: string // eg, "BC1230082 - Certificate - 2021-02-08.pdf"
  link: string // eg, "{LEGAL_API_URL}/{API_VERSION}/businesses/BC1230082/filings/111428/documents/Certificate"
}

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
