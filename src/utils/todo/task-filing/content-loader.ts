import { FilingNames, FilingTypes, CorpTypeCd } from '@bcrs-shared-components/enums'
import { filingTypeToName } from './helper'
import { nrSubtitle } from '~/utils/nr-utils'

/** Get the title string for the todo item based ob the given filing TaskToDoI object */
export const getTitle = (filing: TaskToDoI, corpFullDescription: string): string => {
  const t = useNuxtApp().$i18n.t
  const business = useBcrosBusiness()
  const header = filing.header

  let title = ''

  switch (header.name) {
    case FilingTypes.AGM_EXTENSION:
      return FilingNames.AGM_EXTENSION
    case FilingTypes.AGM_LOCATION_CHANGE:
      return FilingNames.AGM_LOCATION_CHANGE
    case FilingTypes.ALTERATION:
      title = header.priority ? 'Priority ' : ''
      if (business.currentBusiness.legalType !== CorpTypeCd.BENEFIT_COMPANY &&
        filing.alteration.business?.legalType === CorpTypeCd.BENEFIT_COMPANY) {
        title += filingTypeToName(FilingTypes.CHANGE_OF_COMPANY_INFO)
        title += ` - ${corpFullDescription} to a BC Benefit Company`
      } else {
        title += filingTypeToName(FilingTypes.ALTERATION)
      }
      return title
    case FilingTypes.AMALGAMATION_APPLICATION:
      return filingTypeToName(
        FilingTypes.AMALGAMATION_APPLICATION,
        undefined,
        filing.amalgamationApplication.type
      )
    case FilingTypes.ANNUAL_REPORT:
      return `${t('text.todoItem.annualReport.title').replace('AR_YEAR', String(filing.header.ARFilingYear))}`
    case FilingTypes.AMALGAMATION_OUT:
      return FilingNames.AMALGAMATION_OUT
    case FilingTypes.CHANGE_OF_ADDRESS:
      return `${t('text.todoItem.addressChange.title')}`
    case FilingTypes.CHANGE_OF_DIRECTORS:
      return `${t('text.todoItem.directorChange.title')}`
    case FilingTypes.CHANGE_OF_REGISTRATION:
      return `Change to ${corpFullDescription} Registration`
    case FilingTypes.CONSENT_AMALGAMATION_OUT:
      return FilingNames.CONSENT_AMALGAMATION_OUT
    case FilingTypes.CONSENT_CONTINUATION_OUT:
      return FilingNames.CONSENT_CONTINUATION_OUT
    case FilingTypes.CONTINUATION_OUT:
      return FilingNames.CONTINUATION_OUT
    case FilingTypes.CONTINUATION_IN:
      return filingTypeToName(
        FilingTypes.CONTINUATION_IN,
        undefined,
        filing.continuationIn.type,
        filing.header.status
      )
    case FilingTypes.CONVERSION:
      return FilingNames.CONVERSION
    case FilingTypes.CORRECTION:
      title = header.priority ? 'Priority ' : ''
      title += `${filingTypeToName(FilingTypes.CORRECTION)} - ` +
        `${filingTypeToName(filing.correction.correctedFilingType as FilingTypes)}`
      return title
    case FilingTypes.DISSOLUTION:
      return business.businessConfig?.todoList.title
    case FilingTypes.INCORPORATION_APPLICATION:
      return FilingNames.INCORPORATION_APPLICATION
    case FilingTypes.REGISTRATION:
      return filingTypeToName(
        FilingTypes.REGISTRATION,
        undefined,
        filing.registration.type
      )
    case FilingTypes.RESTORATION:
      return filingTypeToName(FilingTypes.RESTORATION, null, filing.restoration.type)
    case FilingTypes.SPECIAL_RESOLUTION:
      title = header.priority ? 'Priority ' : ''
      title += filingTypeToName(FilingTypes.SPECIAL_RESOLUTION)
      return title
    default:
      return filingTypeToName(header.name)
  }
}

/** Get the draft title string for the todo item based ob the given filing TaskToDoI object */
export const getDraftTitle = (filing: TaskToDoI): string => {
  const t = useNuxtApp().$i18n.t
  const header = filing.header

  switch (header.name) {
    case FilingTypes.AGM_EXTENSION:
      return FilingNames.AGM_EXTENSION
    case FilingTypes.AGM_LOCATION_CHANGE:
      return FilingNames.AGM_LOCATION_CHANGE
    case FilingTypes.ALTERATION:
      return FilingNames.ALTERATION
    case FilingTypes.AMALGAMATION_APPLICATION:
      return FilingNames.AMALGAMATION_APPLICATION
    case FilingTypes.ANNUAL_REPORT:
      return `${t('text.todoItem.annualReport.draftTitle').replace('AR_YEAR', String(filing.header.ARFilingYear))}`
    case FilingTypes.CHANGE_OF_ADDRESS:
      return `${t('text.todoItem.addressChange.draftTitle')}`
    case FilingTypes.CHANGE_OF_DIRECTORS:
      return `${t('text.todoItem.directorChange.draftTitle')}`
    case FilingTypes.CHANGE_OF_OFFICERS:
      return FilingNames.CHANGE_OF_OFFICERS
    case FilingTypes.CHANGE_OF_REGISTRATION:
      return FilingNames.CHANGE_OF_REGISTRATION
    case FilingTypes.CONSENT_CONTINUATION_OUT:
      return FilingNames.CONSENT_CONTINUATION_OUT
    case FilingTypes.CONTINUATION_OUT:
      return FilingNames.CONTINUATION_OUT
    case FilingTypes.CONTINUATION_IN:
      return FilingNames.CONTINUATION_AUTHORIZATION
    case FilingTypes.CONVERSION:
      return FilingNames.CONVERSION
    case FilingTypes.CORRECTION:
      return filingTypeToName(FilingTypes.CORRECTION)
    case FilingTypes.DISSOLUTION:
      return filingTypeToName(FilingTypes.DISSOLUTION)
    case FilingTypes.INCORPORATION_APPLICATION:
      return FilingNames.INCORPORATION_APPLICATION
    case FilingTypes.REGISTRATION:
      return FilingNames.REGISTRATION
    case FilingTypes.RESTORATION:
      return filingTypeToName(FilingTypes.RESTORATION, null, filing.restoration.type)
    case FilingTypes.SPECIAL_RESOLUTION:
      return filingTypeToName(FilingTypes.SPECIAL_RESOLUTION)
    default:
      return filingTypeToName(header.name)
  }
}

/** Get the subtitle (a single line of string) or content (a template to render below title) and update the todo item */
export const addSubtitleOrContent = (todoItem: TodoItemI): void => {
  const t = useNuxtApp().$i18n.t
  const isGoodStanding = !!useBcrosBusiness().currentBusiness?.goodStanding
  const filingWithNR = [
    FilingTypes.AMALGAMATION_APPLICATION, FilingTypes.CHANGE_OF_REGISTRATION, FilingTypes.CONTINUATION_IN,
    FilingTypes.INCORPORATION_APPLICATION, FilingTypes.REGISTRATION
  ]

  switch (todoItem.status) {
    case FilingStatusE.DRAFT:
      if (todoItem.isAlteringToBen && isGoodStanding) {
        todoItem.content = TodoContentE.ALTERING_TO_BEN
      } else if (todoItem.payErrorObj) {
        todoItem.subtitle = t('text.todoItem.status.paymentIncomplete')
      } else if (filingWithNR.includes(todoItem.name)) {
        todoItem.subtitle = todoItem.nameRequest ? nrSubtitle(todoItem.nameRequest) : t('text.todoItem.status.draft')
      } else {
        todoItem.subtitle = t('text.todoItem.status.draft')
      }
      break
    case FilingStatusE.PENDING:
      todoItem.content = TodoContentE.PENDING
      break
    case FilingStatusE.PENDING_CORRECTION:
      todoItem.content = TodoContentE.PENDING
      break
    case FilingStatusE.ERROR:
      todoItem.content = TodoContentE.ERROR
      break
    case FilingStatusE.PAID:
      todoItem.content = TodoContentE.PAID
      break
    case FilingStatusE.CHANGE_REQUESTED:
      todoItem.content = TodoContentE.CHANGE_REQUESTED
      break
    case FilingStatusE.APPROVED:
      if (todoItem.name === FilingTypes.CONTINUATION_IN) {
        todoItem.content = TodoContentE.APPROVED_CONTINUATION_IN
      }
      break
    default:
      break
  }
}

/** Add TodoExpansionContent enum to the todo item when the item is expandable */
export const addExpansionContent = (todoItem: TodoItemI): void => {
  if (todoItem.status === FilingStatusE.DRAFT && !!todoItem.payErrorObj) {
    // if there is an incomplete payment error for a draft filing
    todoItem.expansionContent = TodoExpansionContentE.DRAFT_PAYMENT_INCOMPLETE
  } else if (todoItem.name === FilingTypes.CONVERSION) {
    // if it is a conversion filing
    todoItem.expansionContent = TodoExpansionContentE.CONVERSION
  } else if (todoItem.status === FilingStatusE.DRAFT && todoItem.name === FilingTypes.CORRECTION) {
    // if it is a draft correction filing
    todoItem.expansionContent = TodoExpansionContentE.DRAFT_CORRECTION
  } else if (todoItem.name === FilingTypes.CORRECTION) {
    // if it is a non-draft correction filing (pending filing), no expansion panel in this case
  } else if (
    (todoItem.status === FilingStatusE.DRAFT || todoItem.status === FilingStatusE.APPROVED) && todoItem.nameRequest
  ) {
    // if it has a name request (either a draft todo item or an approved continuation-in authorization)
    todoItem.expansionContent = TodoExpansionContentE.DRAFT_WITH_NR
  } else if (todoItem.status === FilingStatusE.PENDING && !todoItem.isPayCompleted) {
    // if it is a pending filing with incomplete payment
    if (todoItem.paymentMethod === PaymentMethodE.ONLINE_BANKING) {
      // for online banking payment
      todoItem.expansionContent = TodoExpansionContentE.PENDING_PAYMENT_ONLINE
    } else {
      // other payment
      todoItem.expansionContent = TodoExpansionContentE.PENDING_PAYMENT
    }
  } else if (todoItem.status === FilingStatusE.CHANGE_REQUESTED) {
    // if it is a filing with a change requested
    todoItem.expansionContent = TodoExpansionContentE.CHANGE_REQUESTED
  } else if (todoItem.status === FilingStatusE.ERROR) {
    // if the filing has the error status
    todoItem.expansionContent = TodoExpansionContentE.PAYMENT_ERROR
  } else if (todoItem.status === FilingStatusE.PAID || todoItem.isPayCompleted) {
    // if the filing has the paid status
    todoItem.expansionContent = TodoExpansionContentE.PAID
  }
}
