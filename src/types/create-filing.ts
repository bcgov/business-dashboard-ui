export type FilingHeaderT = {
  name: string,
  date: string,
  certifiedBy: string
}

export type FilingBusinessT = {
  identifier: string,
  legalType: string,
  legalName: string,
  foundingDate: string,
  startDate?: string
}

export type courtOrderT = {
  effectOfOrder: string,
  fileNumber: string,
  orderDetails?: string,
  fileKey?: string,
  fileName?: string,
  fileLastModified?: number,
  fileSize?: number
}

export type courtOrderFileT = {
  fileKey?: string,
  fileName?: string,
  fileLastModified?: number,
  fileSize?: number
}

export type FilingT = {
  header: FilingHeaderT,
  business: FilingBusinessT,
  adminFreeze?: {
    freeze: boolean
  },
  putBackOn?: {
    details: string,
    courtOrder: courtOrderT
  },
  dissolution?: {
    dissolutionType: FilingSubTypeE,
    dissolutionDate: string,
    details: string,
    courtOrder?: courtOrderT
  },
  courtOrder?: courtOrderT,
  registrarsNotation?: {
    effectOfOrder?: string,
    fileNumber: string,
    orderDetails: string,
  },
  registrarsOrder?: {
    effectOfOrder?: string,
    fileNumber: string,
    orderDetails: string,
  }
}

export type FilingPayloadT = {
  filing: FilingT
}
