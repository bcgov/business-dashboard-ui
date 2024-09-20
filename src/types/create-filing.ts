export type FilingHeaderT = {
  name: string,
  date: string,
  certifiedBy: string
}

export type FilingBusinessT = {
  identifier: string,
  legalType: string,
  legalName: string,
  foundingDate: string
}

export type FilingT = {
  header: FilingHeaderT,
  business: FilingBusinessT,
  adminFreeze?: {
    freeze: boolean
  }
}

export type FreezeFiling = {
  filing: FilingT
}
