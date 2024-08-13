import { v4 as UUIDv4 } from 'uuid'
import { FilingTypes, FilingNames } from '@bcrs-shared-components/enums'
import { doFileNow } from '~/utils/todo/action-functions'

export const buildTodo = (task: TaskI) : TodoItemI | null => {
  const todo = task.task.todo
  const header = todo.header
  let newTodo: TodoItemI | null = null

  if (header) {
    switch (header.name) {
      case FilingTypes.ANNUAL_REPORT:
        newTodo = loadAnnualReportTodo(task)
        break
      case FilingTypes.CONVERSION:
        newTodo = loadConversionTodo(task)
        break
      default:
        console.error('ERROR - invalid name in todo header =', header)
        break
    }
  } else {
    console.error('ERROR - invalid header in todo =', todo)
  }
  return newTodo
}

/** Loads a NEW Annual Report todo. */
const loadAnnualReportTodo = (task: TaskI) : TodoItemI | null => {
  const t = useNuxtApp().$i18n.t
  const todo = task.task.todo
  const header = todo.header
  const business = useBcrosBusiness()
  if (business && header) {
    const ARFilingYear = header.ARFilingYear

    const subtitle = (task.enabled && !business.isBaseCompany())
      ? `${t('text.todoItem.annualReport.subtitle')}`
      : null

    const enabled = task.enabled && !business.isDisableNonBenCorps()

    // NB: for Competent Authority, the isAllowed() always return false so the actionButton remains disabled
    const actionButtonDisabled = !enabled || !business.isAllowed(AllowableActionE.ANNUAL_REPORT)

    // NB: the logic for showAnnualReportCheckbox and showAnnualReportDueDate is almost the same
    // except for checking the BUSINESS_ID in the sessionStorage. We don't have BUSINESS_ID in sessionStorage
    // - Should we check for the identifier of the current business?
    // - or should we combine the two variables?
    const showAnnualReportCheckbox =
      // sessionStorage.getItem('BUSINESS_ID') &&
      business.currentBusiness.identifier &&
      enabled &&
      business.isBaseCompany() &&
      header.status === FilingStatusE.NEW &&
      header.name === FilingTypes.ANNUAL_REPORT

    const showAnnualReportDueDate =
      enabled &&
      business.isBaseCompany() &&
      header.status === FilingStatusE.NEW &&
      header.name === FilingTypes.ANNUAL_REPORT

    const arCheckboxDisabled =
      enabled &&
      !business.isAllowed(AllowableActionE.ANNUAL_REPORT) &&
      !!useBcrosFilings().getPendingCoa()

    const newTodo: TodoItemI = {
      uiUuid: UUIDv4(),
      filingId: -1, // not falsy
      name: FilingTypes.ANNUAL_REPORT,
      title: `${t('text.todoItem.annualReport.title').replace('AR_YEAR', String(ARFilingYear))}`,
      draftTitle: null,
      subtitle,
      showAnnualReportCheckbox,
      showAnnualReportDueDate,
      arCheckboxDisabled,
      ARFilingYear,
      // NB: get min/max AR dates from header object (not business object)
      // same as loading a draft AR
      arMinDate: header.arMinDate, // COOP only
      arMaxDate: header.arMaxDate, // COOP only
      status: header.status || FilingStatusE.NEW,
      enabled,
      order: task.order,
      nextArDate: dateToString(apiToDate(todo.business.nextAnnualReport), 'YYYY-MM-DD'), // BEN/BC/CC/ULC and CBEN/C/CCC/CUL only
      arDueDate: formatToMonthDayYear(header.arMaxDate)
    }

    if (header.status === FilingStatusE.NEW) {
      newTodo.actionButton = {
        label: `${t('button.todoItem.fileAnnualReport')}`,
        actionFn: doFileNow,
        disabled: actionButtonDisabled
      } as ActionButtonI
    }

    return newTodo
  } else {
    console.error('ERROR - invalid header or business in todo =', todo)
  }
}

/** Loads a NEW Annual Report todo. */
const loadConversionTodo = (task: TaskI) : TodoItemI | null => {
  const t = useNuxtApp().$i18n.t

  // regular users can't file a new conversion
  if (!useBcrosAccount().isStaffAccount) {
    return null
  }

  const todo = task.task.todo
  const header = todo.header
  const business = useBcrosBusiness()

  if (business && header) {
    const newTodo: TodoItemI = {
      uiUuid: UUIDv4(),
      filingId: -1, // not falsy
      name: FilingTypes.CONVERSION,
      title: FilingNames.CONVERSION,
      draftTitle: null,
      status: header.status || FilingStatusE.NEW,
      enabled: task.enabled,
      order: task.order,
      warnings: business.currentBusiness.warnings.map(warning => warning.message),
      expansionContent: TodoExpansionContentE.CONVERSION
    }

    if (header.status === FilingStatusE.NEW) {
      newTodo.actionButton = {
        label: `${t('button.todoItem.fileConversion')}`,
        actionFn: doFileNow,
        disabled: !task.enabled
      } as ActionButtonI
    }

    return newTodo
  } else {
    console.error('ERROR - invalid header or business in todo =', todo)
  }
}
