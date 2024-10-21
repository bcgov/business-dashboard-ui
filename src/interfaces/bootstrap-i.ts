export interface BootstrapFilingDataI {
  nameRequest?: NameRequestFilingI
}

export interface BootstrapBusinessI {
  identifier: string
  legalType: string
}

export interface BootstrapFilingI {
  business: BootstrapBusinessI
  amalgamationApplication?: AmalgamationApplicationI
  continuationIn?: BootstrapFilingDataI
  incorporationApplication?: BootstrapFilingDataI
  registration?: BootstrapFilingDataI
  header: TaskApiHeaderI
}

export interface BootstrapFilingApiResponseI {
  commentsCount: number,
  commentsLink: string,
  displayLedger: boolean,
  documentsLink: string,
  filing: BootstrapFilingI,
  filingLink: string,
  isFutureEffective: boolean,
}
