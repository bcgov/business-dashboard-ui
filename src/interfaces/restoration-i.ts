/**
 * A filing's restoration object from the API. See:
 * https://github.com/bcgov/business-schemas/blob/main/src/registry_schemas/schemas/restoration.json
 */
export interface RestorationI {
  expiry?: string // FUTURE: describe date format here
  legalName?: string
  type: FilingSubTypeE
}

/** Restoration filing interface. */
export interface RestorationFilingI {
  header: {
    bcolAccountNumber?: string
    certifiedBy?: string
    date: string
    datNumber?: string
    effectiveDate?: string
    folioNumber?: string
    name: string
    priority?: boolean
    routingSlipNumber?: string
    waiveFees?: boolean
  }
  business: {
    foundingDate: string
    identifier: string
    legalName: string
    legalType: string
  }
  restoration: RestorationI
}
