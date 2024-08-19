import type { FilingTypes } from '@bcrs-shared-components/enums'

export interface ActionButtonI {
  label: string
  actionFn?: Function
  openDialog?: boolean
  disabled?: boolean
  menus?: ActionButtonI[]
  icon?: string
}

/**
 * A Todo List item (ie, local object).
 * See also TaskI.
 */
export interface TodoItemI {
  uiUuid: string
  draftTitle: string
  enabled: boolean
  filingId: number
  name: FilingTypes
  order: number
  status: string
  title: string
  subtitle?: string // Todo ARs and Draft IAs only
  content?: TodoContentE,
  showAnnualReportCheckbox?: boolean
  showAnnualReportDueDate?: boolean
  arCheckboxDisabled?: boolean
  actionButton?: ActionButtonI
  expansionContent?: TodoExpansionContentE,
  comments?: Array<any> // always [] and never used

  // filings only
  paymentMethod?: PaymentMethodE
  paymentToken?: number
  payErrorObj?: PaymentErrorI
  isPayCompleted?: boolean

  // ARs only
  ARFilingYear?: number // YYYY

  // COOP ARs only
  arMinDate?: string // YYYY-MM-DD
  arMaxDate?: string // YYYY-MM-DD

  // BCOMP ARs only
  nextArDate?: string // YYYY-MM-DD
  arDueDate?: string // eg, "Apr 9, 2021"

  // corrections only
  comment?: string
  correctedFilingId?: number
  correctedFilingType?: string

  // conversions only
  warnings?: Array<string>

  // IAs and registrations only
  isEmptyFiling?: boolean
  nameRequest?: any

  // alterations only
  legalType?: string
  isAlteringToBen?: boolean

  // dissolutions and restorations only
  filingSubType?: FilingSubTypeE

  // affiliation invitations only
  affiliationInvitationDetails?: {
    id: number
    fromOrgName: string
    additionalMessage?: string
  }

  // continuation ins only
  submitter?: string
  submittedDate?: Date
  latestReviewComment?: string
}
