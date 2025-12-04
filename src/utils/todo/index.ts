import { FilingTypes } from '@bcrs-shared-components/enums'
import { buildTodo } from './task-todo'
import { buildFilingTodo } from './task-filing'

export const buildTodoItemFromTasks = async (task: TaskI) : Promise<TodoItemI | null> => {
  if (task.task.todo) {
    return buildTodo(task)
  } else if (task.task.filing) {
    return await buildFilingTodo(task)
  } else {
    console.error('ERROR - got unknown task =', task)
    return null
  }
}

/**
 * Returns true if the task is a maintenance filing.
 * If False, this is either a "todo" or a bootstrap task.
 */
export const isMaintenanceFilingTask = (task: TaskI) : boolean => {
  return (
    task.task.filing &&
    [
      FilingTypes.AMALGAMATION_APPLICATION,
      FilingTypes.CONTINUATION_IN,
      FilingTypes.INCORPORATION_APPLICATION,
      FilingTypes.REGISTRATION
    ].includes(task.task.filing.header.name) === false
  )
}

/** Returns true if the task is Pending | Payment Completed. */
export const isPendingPaymentCompletedTask = (task: TaskI) : boolean => {
  return (
    task.task.filing?.header.status === FilingStatusE.PENDING &&
    task.task.filing?.header.paymentStatusCode === PaymentStatusCodeE.COMPLETED
  )
}

/** Returns the task as a filing item. */
export const taskAsFiling = (task: TaskI) : ApiResponseFilingI | null => {
  if (task.task.filing) {
    const filing = task.task.filing
    const business = filing.business
    const header = filing.header

    let filingSubType = null
    if (header.name === FilingTypes.AMALGAMATION_APPLICATION) {
      filingSubType = filing.amalgamationApplication.type || null
    } else if (header.name === FilingTypes.DISSOLUTION) {
      filingSubType = filing.dissolution.dissolutionType || null
    } else if (header.name === FilingTypes.RESTORATION) {
      filingSubType = filing.restoration.type || null
    }
    // TO-DO: add additional sub-types here (eg, receiver/liquidator, liquidation, etc)

    const displayName = useFilingTypeToName().filingTypeToName(header.name, undefined, filingSubType, header.status)

    return {
      availableOnPaperOnly: header.availableOnPaperOnly,
      businessIdentifier: business.identifier,
      commentsCount: 0,
      commentsLink: null,
      displayLedger: true,
      displayName,
      documentsLink: null,
      effectiveDate: apiToUtcString(header.effectiveDate),
      filingId: header.filingId,
      filingLink: null,
      filingSubType,
      isFutureEffective: header.isFutureEffective,
      name: header.name,
      status: header.status,
      submittedDate: header.paymentDate || apiToUtcString(header.date),
      submitter: header.submitter,
      withdrawalPending: false,
      data: {
        applicationDate: dateToYyyyMmDd(apiToDate(header.date)),
        legalFilings: [header.name]
      }
    }
  }
  console.error('ERROR - task has no filing =', task)
  return null
}
