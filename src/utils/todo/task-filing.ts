import { v4 as UUIDv4 } from 'uuid'
import { FilingNames, FilingTypes, CorpTypeCd } from '@bcrs-shared-components/enums'
import { GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module/corp-type-module'
import type { TodoItemI } from '~/interfaces/todo-i'

/** Build TodoItemI from filing TaskToDoI  */
export const buildFilingTodo = async (task: TaskI) : Promise<TodoItemI | null> => {
  const filing = task.task.filing
  const header = filing.header
  const business = useBcrosBusiness()

  let newTodo: TodoItemI | null = null

  let corpFullDescription = ''
  if (business) {
    corpFullDescription = GetCorpFullDescription(business.currentBusiness.legalType)
  }
  const agmExtension = filing.agmExtension
  const agmLocationChange = filing.agmLocationChange
  const alteration = filing.alteration
  const amalgamation = filing.amalgamationApplication
  const annualReport = filing.annualReport
  // const changeOfAddress = filing.changeOfAddress
  // const changeOfDirectors = filing.changeOfDirectors
  // const changeOfRegistration = filing.changeOfRegistration
  const consentContinuationOut = filing.consentContinuationOut
  const continuationOut = filing.continuationOut
  const continuationIn = filing.continuationIn
  const conversion = filing.conversion
  const correction = filing.correction
  const dissolution = filing.dissolution
  const incorporationApplication = filing.incorporationApplication
  const registration = filing.registration
  const restoration = filing.restoration
  const specialResolution = filing.specialResolution

  if (header) {
    const paymentStatusCode = header.paymentStatusCode
    const payErrorObj = paymentStatusCode && await getPayErrorObj(paymentStatusCode)

    newTodo = {
      uiUuid: UUIDv4(),
      name: header.name,
      filingId: header.filingId,
      title: getTitle(filing),
      draftTitle: getDraftTitle(filing),
      status: header.status,
      enabled: task.enabled,
      order: task.order,
      paymentMethod: header.paymentMethod || null,
      paymentToken: header.paymentToken || null,
      payErrorObj,
      isPayCompleted: (paymentStatusCode === 'COMPLETED')
    } as TodoItemI

    // determine the subtitle (a single line of string) or content (a template to render below title) for the newTodo
    addSubtitleOrContent(newTodo)

    // Add the filingSubType field to newTodo if needed
    if (dissolution) { newTodo.filingSubType = dissolution.dissolutionType }
    if (restoration) { newTodo.filingSubType = restoration.type }

    // Add the legalType field to newTodo if needed
    if (alteration || dissolution || restoration || specialResolution) {
      newTodo.legalType = corpFullDescription
    }

    // Add the warning field to newTodo if needed
    if (business && (agmExtension || agmLocationChange || consentContinuationOut || continuationOut || conversion)) {
      newTodo.warnings = business.currentBusiness.warnings.map(warning => warning.message)
    }

    // For alteration filing, add isAlteringToBen field to newTodo
    if (alteration) {
      newTodo.isAlteringToBen = (
        business.currentBusiness.legalType !== CorpTypeCd.BENEFIT_COMPANY &&
        alteration.business?.legalType === CorpTypeCd.BENEFIT_COMPANY
      )
    }

    // Add isEmptyFiling field to newTodo if needed
    if (amalgamation || continuationIn || incorporationApplication || registration) {
      const emptyAmagamation = !(
        amalgamation?.amalgamatingBusinesses ||
        amalgamation?.offices ||
        amalgamation?.contactPoint ||
        amalgamation?.parties ||
        amalgamation?.shareStructure?.shareClasses
      )

      const emptyContinuationIn = !(
        continuationIn?.authorization ||
        continuationIn?.contactPoint ||
        continuationIn?.foreignJurisdiction ||
        continuationIn?.offices ||
        continuationIn?.parties ||
        continuationIn?.shareStructure
      )

      const emptyIncorporationApplication = !(
        incorporationApplication?.offices ||
        incorporationApplication?.contactPoint ||
        incorporationApplication?.parties ||
        incorporationApplication?.shareClasses
      )

      const emptyRegistration = !(
        registration?.offices ||
        registration?.contactPoint ||
        registration?.parties ||
        registration?.shareClasses
      )

      newTodo.isEmptyFiling =
        emptyAmagamation || emptyContinuationIn || emptyIncorporationApplication || emptyRegistration
    }

    // For AR filing, add relevant fields to newTodo
    if (annualReport) {
      newTodo.ARFilingYear = header.ARFilingYear
      newTodo.arMinDate = header.arMinDate
      newTodo.arMaxDate = header.arMaxDate
      newTodo.nextArDate = annualReport.nextArDate
    }

    // TO-DO -- Add the nameRequest field to newTodo if needed

    // For Continuation In filing, add submission information (e.g., submitter, submittedDate, latestReviewComment)
    if (continuationIn) {
      newTodo.submitter = header.submitter
      newTodo.submittedDate = new Date(header.date)
      newTodo.latestReviewComment = header.latestReviewComment
    }

    // For Correction filing, add the comment, correctedFilingId, correctedFilingType field to newTodo
    if (correction) {
      newTodo.correctedFilingId = correction.correctedFilingId
      newTodo.correctedFilingType = filingTypeToName(correction.correctedFilingType as FilingTypes)
      newTodo.comment = correction.comment
    }

    // Add the actionButton for newTodo

    // Config the View Detail button style

    // Determine the content panel
  } else {
    console.error('ERROR - invalid header in filing =', filing)
  }

  return newTodo
}

/** Get the title string for the todo item based ob the given filing TaskToDoI object */
const getTitle = (filing: TaskToDoI): string => {
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
const getDraftTitle = (filing: TaskToDoI): string => {
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

/** Get the subtitle (a single line of string) or content (a template to render below title) and update the TaskToDoI */
const addSubtitleOrContent = (todoItem: TodoItemI): void => {
  const filingWithNR = [
    FilingTypes.AMALGAMATION_APPLICATION, FilingTypes.CHANGE_OF_REGISTRATION, FilingTypes.CONTINUATION_IN,
    FilingTypes.INCORPORATION_APPLICATION, FilingTypes.REGISTRATION
  ]

  switch (todoItem.status) {
    case FilingStatusE.DRAFT:
      if (todoItem.payErrorObj) {
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

// /** Whether to show the details button with blue color. */
// const showDetailsBtnBlue = (item: TodoItemI): boolean => {
//   if (isStatusNew(item)) {
//     if (isTypeConversion(item)) return true
//   }

//   if (isStatusDraft(item)) {
//     if (isTypeConversion(item)) return true
//     if (isTypeAmalgamationApplication(item) && item.nameRequest) return true
//     if (isTypeContinuationIn(item) && item.nameRequest) return true
//     if (isTypeIncorporationApplication(item) && item.nameRequest) return true
//     if (isTypeRegistration(item) && item.nameRequest) return true
//   }

//   if (isStatusChangeRequested(item)) {
//     if (isTypeContinuationIn(item)) return true
//   }

//   if (isStatusPending(item)) return true

//   // if (this.isAffiliationInvitation(item)) return true

//   return false
// }

// /** Whether to show the details button with red color. */
// const showDetailsBtnRed = (item: TodoItemI): boolean => {
//   if (isStatusDraft(item) && isTypeCorrection(item)) return true
//   if (isStatusDraft(item) && isPayError(item)) return true
//   if (isStatusError(item) && (inProcessFiling !== item.filingId)) return true
//   if (isStatusPaid(item) && (inProcessFiling !== item.filingId)) return true
//   return false
// }
