import { CorpTypeCd } from '@bcrs-shared-components/enums'

export interface IncludedChangeI {
  label: string;
  description: string;
}

export interface ObligationsI {
  title: string;
  subtitle: string;
  act: string;
  obligationStatement: string;
  detailInfoURL: string;
  includedChanges: IncludedChangeI[];
}

export interface FlowI {
  feeCode: null | string;
  displayName: string;
  certifyText: string;
}

export interface DissolutionConfirmationI {
  entityTitle: string;
  subTitle: string;
  act: string;
  modalTitle: string;
  confirmButtonText: string;
  additionalLabel?: string;
  dissolutionType: string;
}

export interface BusinessConfigI {
  entityType: CorpTypeCd
  displayName: string
  flows: FlowI[]
  obligations?: ObligationsI
  dissolutionConfirmation?: DissolutionConfirmationI
  todoList: { title: string }
}
