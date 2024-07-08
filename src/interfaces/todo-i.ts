import type { FilingTypes } from '@bcrs-shared-components/enums'
import type { PaymentMethodE } from '~/enums/payment-method-e'
import type { PaymentErrorI } from '~/interfaces/payment-error-i'
import type { FilingSubTypeE } from '~/enums/filing-sub-type-e'

/**
 * A Todo List item (ie, local object).
 * See also ApiTaskIF.
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
  comments?: Array<any> // always [] and never used

  // Todo ARs and Draft IAs only
  subtitle?: string

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
}

export interface TodoAffiliationI {

}
