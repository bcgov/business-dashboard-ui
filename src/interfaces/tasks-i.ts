import { FilingTypes } from '@bcrs-shared-components/enums'
import type { AlterationIF, SpecialResolutionIF } from '@bcrs-shared-components/interfaces'

export interface TaskApiHeaderI {
  accountId?: number // NOT USED
  ARFilingYear?: number // ARs only
  arMaxDate?: string // ARs only
  arMinDate?: string // ARs only
  availableOnPaperOnly?: boolean // non-tasks only
  certifiedBy: string // FUTURE: is this obsolete?
  comments: any[]
  commentsCount: number
  commentsLink: string
  date: string // submitted date
  documentsLink: string
  effectiveDate: string // FUTURE: is this obsolete?
  email?: string // FUTURE: is this obsolete?
  filingId: number
  filingLink: string
  inColinOnly?: boolean // FUTURE: is this obsolete?
  isCorrected: boolean
  isCorrectionPending: boolean
  isFutureEffective: boolean // FUTURE: is this obsolete?
  name: FilingTypes
  paymentMethod?: any
  paymentStatusCode?: string
  paymentToken?: any // NB: may be UUID in future
  priority?: boolean // alterations and corrections only
  status: FilingStatusE
  submitter: string // FUTURE: is this obsolete?
}

export interface TaskToDoI {
  agmExtension?: any
  agmLocationChange?: any
  alteration?: AlterationIF
  amalgamationApplication?: AmalgamationApplicationI
  annualReport?: any
  business: BusinessI
  changeOfAddress?: any
  changeOfDirectors?: any
  changeOfRegistration?: any
  consentContinuationOut?: any
  continuationIn?:any
  continuationOut?: any
  conversion?: any
  correction?: any
  courtOrder?: any
  displayName?: string // for app tasks only
  dissolution?: any
  documents?: Array<any>
  header: TaskApiHeaderI
  incorporationApplication?: any
  registrarsNotation?: any
  registrarsOrder?: any
  registration?: any
  restoration?: RestorationI
  specialResolution?: SpecialResolutionIF
}

/**
 * A task object from the Legal API ("tasks" call), which contains a draft filing or a todo item.
 */
export interface TaskI {
  enabled: boolean
  order: number
  task: {
    // content is either a filing or a todo object
    filing?: TaskToDoI
    todo?: TaskToDoI
  }
}

export interface TasksI {
  tasks: TaskI[]
}
