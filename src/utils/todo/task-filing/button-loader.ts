import { FilingTypes } from '@bcrs-shared-components/enums'
import { filingTypeToName } from './helper'
import * as actionFunctions from '~/utils/todo/action-functions'

/** Add actionButton to the todo item */
// https://docs.google.com/spreadsheets/d/1rJY3zsrdHS2qii5xb7hq1gt-D55NsakJtdu9ld9d80U/edit?gid=792248919#gid=792248919
export const addActionButton = (todoItem: TodoItemI): void => {
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
      icon: 'i-mdi-delete-forever',
      actionFn: actionFunctions.confirmDeleteDraft
    }
    dropdownButtons.push(button)
  }

  if (tempRegNumber) {
    dropdownButtons.push({
      label: `Delete ${filingTypeToName(todoItem.name)}`,
      icon: 'mdi-delete-forever',
      actionFn: actionFunctions.confirmDeleteApplication
    } as ActionButtonI)
  }

  return dropdownButtons
}
