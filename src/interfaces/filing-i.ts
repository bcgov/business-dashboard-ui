import { CorpTypeCd, FilingTypes } from '@bcrs-shared-components/enums'

/** Filing interface. */
export interface FilingI {
  header: {
    name: FilingTypes
    certifiedBy: string
    date: string
    effectiveDate?: string
    filingId?: number
    folioNumber?: string
    isFutureEffective: boolean

    // staff payment properties:
    routingSlipNumber?: string
    bcolAccountNumber?: string
    datNumber?: string
    waiveFees?: boolean
    priority?: boolean
  }
  business: {
    legalType: CorpTypeCd
    identifier: string
  }
}
