import { v4 as UUIDv4 } from 'uuid'
import { FilingTypes } from '@bcrs-shared-components/enums'
import type { TodoItemI } from '~/interfaces/todo-i'

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
        /** TO-DO: 'Conversion' Action */
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

    const actionButton: ActionButtonI = {
      label: `${t('text.todoItem.annualReport.actionButton')}`,
      actionFn: doFileNow,
      disabled: actionButtonDisabled
    }

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
      actionButton,
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

    return newTodo
  } else {
    console.error('ERROR - invalid header or business in todo =', todo)
  }
}

/** Files a new filing (todo item). */
const doFileNow = (item: TodoItemI) => {
  const business = useBcrosBusiness()
  const { redirect } = useBcrosNavigate()
  switch (item.name) {
    case FilingTypes.ANNUAL_REPORT: {
      // file the subject Annual Report

      // TO-DO: the following lines are copied from the old codebase. What does it do ????
      // this.setARFilingYear(item.ARFilingYear)
      // this.setArMinDate(item.arMinDate) // COOP only
      // this.setArMaxDate(item.arMaxDate) // COOP only
      // this.setNextARDate(item.nextArDate) // BEN/BC/CC/ULC and CBEN/C/CCC/CUL only
      // this.$router.push({ name: Routes.ANNUAL_REPORT, params: { filingId: '0' } }) // 0 means "new AR"

      // TO-DO: the redirect is block. Currently, users will be redirected to the old dashboard instead of
      // the annual report filing page
      const url = `${useRuntimeConfig().public.dashboardOldUrl}/${business.currentBusiness.identifier}/annual-report`
      redirect(url, { filingId: '0' }) // 0 means "new AR"
      break
    }
    case FilingTypes.CONVERSION: {
      // TO-DO: go to conversion filing
      break
    }
    default:
      console.error('doFileNow(), invalid type for task =', item)
      break
  }
}
