import { FilingTypes } from '@bcrs-shared-components/enums'
import { filingTypeToName, isStaffTodo } from './helper'
import * as actionFunctions from '~/utils/todo/action-functions'

/** Add actionButton to the todo item */
// https://docs.google.com/spreadsheets/d/1rJY3zsrdHS2qii5xb7hq1gt-D55NsakJtdu9ld9d80U/edit?gid=792248919#gid=792248919
export const addActionButton = (todoItem: TodoItemI): void => {
  const t = useNuxtApp().$i18n.t
  const { isStaffAccount } = useBcrosAccount()

  // non-staff see no buttons for staff filings (cont out, conversion, correction, restoration)
  if (!isStaffAccount && isStaffTodo(todoItem)) {
    return
  }

  switch (todoItem.status) {
    // a draft filing
    case FilingStatusE.DRAFT:
      // special case: just a "Delete draft" button with no dropdown menu
      if (showDeleteOnly(todoItem)) {
        todoItem.actionButton = {
          label: t('button.todoItem.deleteDraft'), openDialog: true
        } as ActionButtonI
      } else {
        // Base case: 'Resume' button with 'doResumeFiling' action function
        const actionButton = {
          label: t('button.todoItem.resume'), disabled: !todoItem.enabled, actionFn: actionFunctions.doResumeFiling
        } as ActionButtonI

        // update the button label for special cases
        if (todoItem.isEmptyFiling) {
          switch (todoItem.name) {
            case FilingTypes.AMALGAMATION_APPLICATION:
              actionButton.label = t('button.todoItem.amgApplication')
              break
            case FilingTypes.INCORPORATION_APPLICATION:
              todoItem.nameRequest
                ? actionButton.label = t('button.todoItem.incorporationApplicationWithNr')
                : actionButton.label = t('button.todoItem.incorporationApplication')
              break
            case FilingTypes.REGISTRATION:
              actionButton.label = t('button.todoItem.registration')
              break
            case FilingTypes.CONTINUATION_IN:
              actionButton.label = t('button.todoItem.continuationIn')
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
      if (!todoItem.isPayCompleted) {
        let label = t('button.todoItem.resumePayment')
        if (todoItem.paymentMethod === PaymentMethodE.ONLINE_BANKING) {
          label = t('button.todoItem.changePaymentType')
        }
        todoItem.actionButton = {
          label, disabled: !todoItem.enabled, actionFn: actionFunctions.doResumePayment
        } as ActionButtonI

        // add the dropdown button
        todoItem.actionButton.menus = [{
          label: t('button.todoItem.cancelPayment'), openDialog: true
        }] as ActionButtonI[]
      }

      break

    case FilingStatusE.ERROR:
      // a filing with the error status (due to payment failure) -- No dropdown buttons
      todoItem.actionButton = {
        label: t('button.todoItem.retryPayment'), disabled: !todoItem.enabled, actionFn: actionFunctions.doResumePayment
      } as ActionButtonI

      break

    case FilingStatusE.CHANGE_REQUESTED:
      // a filing with the Change Requested status -- No dropdown buttons
      todoItem.actionButton = {
        label: t('button.todoItem.makeChanges'), disabled: !todoItem.enabled, actionFn: actionFunctions.doResumeFiling
      } as ActionButtonI

      break

    case FilingStatusE.APPROVED:
      todoItem.actionButton = {
        label: t('button.todoItem.resume'), disabled: !todoItem.enabled, actionFn: actionFunctions.doResumeFiling
      } as ActionButtonI

      break

    default:
      break
  }
}

/** Determine whether to show the 'Delete draft' button only for a draft item */
const showDeleteOnly = (todoItem: TodoItemI): boolean => {
  const business = useBcrosBusiness()
  const { isStaffAccount } = useBcrosAccount()
  const filingType = todoItem.name

  switch (filingType) {
    case FilingTypes.AMALGAMATION_APPLICATION:
    case FilingTypes.ANNUAL_REPORT:
    case FilingTypes.CHANGE_OF_DIRECTORS:
    case FilingTypes.CHANGE_OF_ADDRESS:
    case FilingTypes.CONSENT_CONTINUATION_OUT:
    case FilingTypes.CONTINUATION_IN:
    case FilingTypes.CONTINUATION_OUT:
    case FilingTypes.CORRECTION:
    case FilingTypes.INCORPORATION_APPLICATION:
    case FilingTypes.REGISTRATION:
    case FilingTypes.CHANGE_OF_REGISTRATION:
    case FilingTypes.CONVERSION:
    case FilingTypes.RESTORATION:
      return false
    case FilingTypes.ALTERATION:
    case FilingTypes.DISSOLUTION:
    case FilingTypes.SPECIAL_RESOLUTION:
      return business && !business.currentBusiness.goodStanding && !isStaffAccount
    default:
      return true
  }
}

/** Get dropdown menu buttons for draft filing */
const getDropdownButtonsForDraft = (todoItem: TodoItemI): Array<ActionButtonI> => {
  const t = useNuxtApp().$i18n.t
  const business = useBcrosBusiness()

  if (business.currentBusinessIdentifier) {
    let label = t('button.todoItem.deleteDraft')
    if (todoItem.filingSubType === FilingSubTypeE.DISSOLUTION_VOLUNTARY) {
      label = `${t('button.todoItem.delete')} ${business.businessConfig.todoList.title}`
    } else if (todoItem.name === FilingTypes.SPECIAL_RESOLUTION) {
      label = t('button.todoItem.deleteSpecialResolution')
    } else if (todoItem.name === FilingTypes.ALTERATION) {
      label = t('button.todoItem.deleteAlteration')
    }
    return ([{
      label,
      icon: 'i-mdi-delete-forever',
      openDialog: true
    }])
  }

  // is business bootstrap item
  return [{
    label: `Delete ${filingTypeToName(todoItem.name, undefined, undefined, todoItem.status as FilingStatusE)}`,
    icon: 'i-mdi-delete-forever',
    openDialog: true
  } as ActionButtonI]
}
