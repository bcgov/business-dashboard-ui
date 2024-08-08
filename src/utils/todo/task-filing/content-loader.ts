import { FilingNames, FilingTypes, CorpTypeCd } from '@bcrs-shared-components/enums'
import { GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module/corp-type-module'
import { filingTypeToName } from './helper'

/** Get the title string for the todo item based ob the given filing TaskToDoI object */
export const getTitle = (filing: TaskToDoI): string => {
  const t = useNuxtApp().$i18n.t
  const business = useBcrosBusiness()
  const header = filing.header

  let corpFullDescription = ''
  if (business) {
    corpFullDescription = GetCorpFullDescription(business.currentBusiness.legalType)
  }

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
      return filing.displayName
    case FilingTypes.ANNUAL_REPORT:
      return `${t('text.todoItem.annualReport.title').replace('AR_YEAR', String(filing.header.ARFilingYear))}`
    case FilingTypes.CHANGE_OF_ADDRESS:
      return `${t('text.todoItem.addressChange.title')}`
    case FilingTypes.CHANGE_OF_DIRECTORS:
      return `${t('text.todoItem.directorChange.title')}`
    case FilingTypes.CHANGE_OF_REGISTRATION:
      return `Change to ${corpFullDescription} Registration`
    case FilingTypes.CONSENT_CONTINUATION_OUT:
      return FilingNames.CONSENT_CONTINUATION_OUT
    case FilingTypes.CONTINUATION_OUT:
      return FilingNames.CONTINUATION_OUT
    case FilingTypes.CONTINUATION_IN:
      return filing.displayName
    case FilingTypes.CONVERSION:
      return FilingNames.CONVERSION
    case FilingTypes.CORRECTION:
      title = header.priority ? 'Priority ' : ''
      title += `${filingTypeToName(FilingTypes.CORRECTION)} - ` +
        `${filingTypeToName(filing.correction.correctedFilingType as FilingTypes)}`
      return title
    case FilingTypes.DISSOLUTION:
      // TO-DO: get data from the 'configObject', which is saved in rootStore in the old codebase
      return title
    case FilingTypes.INCORPORATION_APPLICATION:
      return filing.displayName
    case FilingTypes.REGISTRATION:
      return filing.displayName
    case FilingTypes.RESTORATION:
      return filingTypeToName(FilingTypes.RESTORATION, null, filing.restoration.type)
    case FilingTypes.SPECIAL_RESOLUTION:
      title = header.priority ? 'Priority ' : ''
      title += filingTypeToName(FilingTypes.SPECIAL_RESOLUTION)
      return title
    default:
      return title
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
    case FilingTypes.CHANGE_OF_REGISTRATION:
      return FilingNames.CHANGE_OF_REGISTRATION
    case FilingTypes.CONSENT_CONTINUATION_OUT:
      return FilingNames.CONSENT_CONTINUATION_OUT
    case FilingTypes.CONTINUATION_OUT:
      return FilingNames.CONTINUATION_OUT
    case FilingTypes.CONTINUATION_IN:
      return FilingNames.CONTINUATION_IN_APPLICATION
    case FilingTypes.CONVERSION:
      return FilingNames.CONVERSION
    case FilingTypes.CORRECTION:
      return filingTypeToName(FilingTypes.CORRECTION)
    case FilingTypes.DISSOLUTION:
      return filingTypeToName(FilingTypes.DISSOLUTION)
    case FilingTypes.INCORPORATION_APPLICATION:
      return filing.displayName
    case FilingTypes.REGISTRATION:
      return filing.displayName
    case FilingTypes.RESTORATION:
      return filingTypeToName(FilingTypes.RESTORATION, null, filing.restoration.type)
    case FilingTypes.SPECIAL_RESOLUTION:
      return filingTypeToName(FilingTypes.SPECIAL_RESOLUTION)
    default:
      return ''
  }
}

/** Get the subtitle (a single line of string) or content (a template to render below title) and update the todo item */
export const addSubtitleOrContent = (todoItem: TodoItemI): void => {
  const business = useBcrosBusiness()
  const isGoodStanding = business?.currentBusiness.goodStanding
  const filingWithNR = [
    FilingTypes.AMALGAMATION_APPLICATION, FilingTypes.CHANGE_OF_REGISTRATION, FilingTypes.CONTINUATION_IN,
    FilingTypes.INCORPORATION_APPLICATION, FilingTypes.REGISTRATION
  ]

  switch (todoItem.status) {
    case FilingStatusE.DRAFT:
      if (todoItem.isAlteringToBen && isGoodStanding) {
        todoItem.content = TodoContentE.ALTERING_TO_BEN
      } else if (todoItem.payErrorObj) {
        todoItem.subtitle = 'PAYMENT INCOMPLETE'
      } else if (filingWithNR.includes(todoItem.name)) {
        // TO-DO: the subtitle is special if nameRequest exists --- updated this when NameRequest store is implemented
        // if (this.getNameRequest) {
        //   subtitle = `NR APPROVED - ${this.expiresText(this.getNameRequest)}`
        // } else { subtitle = 'DRAFT' }
        todoItem.subtitle = 'DRAFT'
      } else {
        todoItem.subtitle = 'DRAFT'
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
    default:
      break
  }
}

/** Add TodoExpansionContent enum to the todo item when the item is expandable */
export const addExpansionContent = (todoItem: TodoItemI): void => {
  // NB.: this logic is obtained from the 'isFilingWithNr' function in the old codebase.
  // FilingTypes.CHANGE_OF_REGISTRATION is missing compared to the filingWithNR array
  // in addSubtitleOrContent function above.
  const filingWithNR = [
    FilingTypes.AMALGAMATION_APPLICATION, FilingTypes.CONTINUATION_IN,
    FilingTypes.INCORPORATION_APPLICATION, FilingTypes.REGISTRATION
  ]

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
    // if it is a correction filing (non-draft)
    todoItem.expansionContent = TodoExpansionContentE.CORRECTION
  } else if (todoItem.status === FilingStatusE.DRAFT && filingWithNR.includes(todoItem.name)) {
    // if it is a draft with name request
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
  } else if (todoItem.status === FilingStatusE.PAID) {
    // if the filing has the paid status
    todoItem.expansionContent = TodoExpansionContentE.PAID
  }
}
