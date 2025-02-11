export enum DocumentClassEnum {
  CORP = 'CORP'
}

export enum DocumetTypeEnum {
 COU = 'COU', // Court Order
}

export const DOCUMENT_TYPES = {
  CourtOrder: {
    class: DocumentClassEnum.CORP,
    type: DocumetTypeEnum.COU
  }
}
