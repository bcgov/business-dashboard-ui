import type { ApiDateTimeUtc } from '@bcrs-shared-components/interfaces'

export interface BootstrapFilingDataI {
  nameRequest?: NameRequestFilingI
  offices?: EntityAddressCollectionI
  parties?: PartyI[]
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
  noticeOfWithdrawal?: any
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
  withdrawalPending: boolean
}
