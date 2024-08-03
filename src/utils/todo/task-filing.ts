import { v4 as UUIDv4 } from 'uuid'
import { FilingNames, FilingTypes, CorpTypeCd } from '@bcrs-shared-components/enums'
import { GetCorpFullDescription } from '@bcrs-shared-components/corp-type-module/corp-type-module'
import type { ActionButtonI, TodoItemI } from '~/interfaces/todo-i'
import * as actionFunctions from '~/utils/todo/action-functions'

/** Build TodoItemI from filing TaskToDoI  */
// https://docs.google.com/spreadsheets/d/1rJY3zsrdHS2qii5xb7hq1gt-D55NsakJtdu9ld9d80U/edit?gid=0#gid=0
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
    addActionButton(newTodo)

    // Determine the extension content panel
    addExpansionContent(newTodo)
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

/** Get the subtitle (a single line of string) or content (a template to render below title) and update the todo item */
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

/** Add TodoExpansionContent enum to the todo item when the item is expandable */
const addExpansionContent = (todoItem: TodoItemI): void => {
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

/** Add actionButton to the todo item */
// https://docs.google.com/spreadsheets/d/1rJY3zsrdHS2qii5xb7hq1gt-D55NsakJtdu9ld9d80U/edit?gid=792248919#gid=792248919
const addActionButton = (todoItem: TodoItemI): void => {
  switch (todoItem.status) {
    // a draft filing
    case FilingStatusE.DRAFT:
      // special case: just a "Delete draft" button with no dropdown menu
      if (showDeleteOnly(todoItem)) {
        todoItem.actionButton = {
          label: 'Delete draft', actionFn: actionFunctions.confirmDeleteDraft
        } as ActionButtonI
      } else {
        // Base case: 'Resume' button with 'doResumeFiling' action function
        const actionButton = {
          label: 'Resume', disabled: !todoItem.enabled, actionFn: actionFunctions.doResumeFiling
        } as ActionButtonI

        // update the button label for special cases
        if (todoItem.isEmptyFiling) {
          switch (todoItem.name) {
            case FilingTypes.AMALGAMATION_APPLICATION:
              actionButton.label = 'Fill out Amalgamation Application'
              break
            case FilingTypes.INCORPORATION_APPLICATION:
              // TO-DO: different label text for name request
              actionButton.label = 'Incorporate a Numbered Company'
              break
            case FilingTypes.REGISTRATION:
              actionButton.label = 'Register using this NR'
              break
            case FilingTypes.CONTINUATION_IN:
              // TO-DO: different label text for name request
              actionButton.label = 'Continue In as a Numbered Company'
              break
            default:
              break
          }
        }

        // add the dropdown button
        actionButton.menus = getDropdownButtonsForDraft(todoItem)

        todoItem.actionButton = actionButton
      }
      break

    case FilingStatusE.PENDING:
      // a pending filing with incomplete payment
      if (todoItem.isPayCompleted) {
        let label = 'Resume Payment'
        if (todoItem.paymentMethod === PaymentMethodE.ONLINE_BANKING) {
          label = 'Change Payment Type'
        }
        todoItem.actionButton = {
          label, disabled: !todoItem.enabled, actionFn: actionFunctions.doResumePayment
        } as ActionButtonI
      }

      // add the dropdown button
      todoItem.actionButton.menus = [{
        label: 'Cancel Payment', actionFn: actionFunctions.confirmCancelPayment
      }] as ActionButtonI[]

      break

    case FilingStatusE.ERROR:
      // a filing with the error status (due to payment failure) -- No dropdown buttons
      todoItem.actionButton = {
        label: 'Retry Payment', disabled: !todoItem.enabled, actionFn: actionFunctions.doResumePayment
      } as ActionButtonI

      break

    case FilingStatusE.CHANGE_REQUESTED:
      // a filing with the Change Requested status -- No dropdown buttons
      todoItem.actionButton = {
        label: 'Make Changes', disabled: !todoItem.enabled, actionFn: actionFunctions.doResumeFiling
      } as ActionButtonI

      break

    default:
      break
  }
}

/** Determine whether to show the 'Delete draft' button only for a draft item */
const showDeleteOnly = (todoItem: TodoItemI): boolean => {
  const business = useBcrosBusiness()
  const account = useBcrosAccount()
  const filingType = todoItem.name
  if (filingType === FilingTypes.ALTERATION || filingType === FilingTypes.DISSOLUTION) {
    // Alteration filing draft and Dissolution filing draft can only be deleted
    return true
  } else if (filingType === FilingTypes.SPECIAL_RESOLUTION) {
    // if a business is not in good standing, non-staff role can only delete the Special Resolution draft
    return business && !business.currentBusiness.goodStanding &&
      account && account.currentAccount.accountType !== AccountTypeE.STAFF
  } else {
    return false
  }
}

/** Get dropdown menu buttons for draft filing */
const getDropdownButtonsForDraft = (todoItem: TodoItemI): Array<ActionButtonI> => {
  const dropdownButtons: Array<ActionButtonI> = []
  const business = useBcrosBusiness()
  const businessId = business.currentBusiness.identifier
  const tempRegNumber = sessionStorage.getItem('TEMP_REG_NUMBER')

  if (businessId) {
    let label = 'Delete draft'
    if (todoItem.filingSubType === FilingSubTypeE.DISSOLUTION_VOLUNTARY) {
      label = `Delete ${business.businessConfig.todoList.title}`
    } else if (todoItem.name === FilingTypes.SPECIAL_RESOLUTION) {
      label = 'Delete Special Resolution'
    } else if (todoItem.name === FilingTypes.ALTERATION) {
      label = 'Delete changes to company information'
    }
    const button = {
      label,
      actionFn: actionFunctions.confirmDeleteDraft
    }
    dropdownButtons.push(button)
  }

  if (tempRegNumber) {
    dropdownButtons.push({
      label: `Delete ${filingTypeToName(todoItem.name)}`,
      actionFn: actionFunctions.confirmDeleteApplication
    } as ActionButtonI)
  }

  return dropdownButtons
}
