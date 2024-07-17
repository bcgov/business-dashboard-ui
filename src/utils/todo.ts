import { v4 as UUIDv4 } from 'uuid'
import { FilingTypes } from '@bcrs-shared-components/enums'
import type { AffiliationInvitationI } from '~/interfaces/affiliation-invitation-i'
import type { TodoItemI } from '~/interfaces/todo-i'

export const buildTodoItemFromAffiliationInvitation =
  (affiliationInvitation: AffiliationInvitationI, order: number) : TodoItemI => {
    const t = useNuxtApp().$i18n.t
    const newTodo: TodoItemI = {
      uiUuid: UUIDv4(),
      draftTitle: null,
      enabled: true,
      filingId: -1, // not a filing
      name: null,
      order,
      subtitle: `From: ${affiliationInvitation.fromOrg.name}`,
      contentPanel: ContentPanelE.AffiliationInvitation,
      status: null,
      title: `${t('title.todoItem.affiliationRequest')}`,
      affiliationInvitationDetails: {
        id: affiliationInvitation.id,
        fromOrgName: affiliationInvitation.fromOrg.name,
        additionalMessage: affiliationInvitation.additionalMessage || ''
      }
    }
    return newTodo
  }

export const buildTodoItemFromTasks = (task: TaskI) : TodoItemI | null => {
  if (task.task.todo) {
    return buildTodo(task)
  } else if (task.task.filing) {
    return buildFilinngTodo(task)
  } else {
    console.error('ERROR - got unknown task =', task)
    return null
  }
}

const buildTodo = (task: TaskI) : TodoItemI | null => {
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
  const todo = task.task.todo
  const header = todo.header
  const business = useBcrosBusiness()
  if (business && header) {
    const ARFilingYear = header.ARFilingYear

    const subtitle = (task.enabled && !business.isBaseCompany())
      ? '(including Address and/or Director Change)'
      : null

    const enabled = task.enabled && !business.isDisableNonBenCorps()

    // TO-DO: business.isAllowed() will always return false for KIAL DEV 1 account
    // since the business.allowedAction.filing.filingTypes array is empty.
    // All the action button will remain disabled for KIAL DEV 1 account.
    // KIAL DEV 2 works
    const actionButtonDisabled = !enabled || !business.isAllowed(AllowableActionE.ANNUAL_REPORT)

    const actionButton: ActionButtonI = {
      label: 'File Annual Report',
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
      title: `File ${ARFilingYear} Annual Report`,
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

/** TO-DO load items when the task is filing. Change it to async after implementing functions that loads data */
const buildFilinngTodo = (task: TaskI) : TodoItemI | null => {
  const filing = task.task.filing
  const header = filing.header

  if (header) {
    switch (header.name) {
      case FilingTypes.AGM_EXTENSION:
        /** TO-DO: implement loadAgmExtension(task) */
        break
      case FilingTypes.AGM_LOCATION_CHANGE:
        /** TO-DO: implement loadAgmLocationChange(task) */
        break
      case FilingTypes.ALTERATION:
        /** TO-DO: implement loadAlteration(task) */
        break
      case FilingTypes.AMALGAMATION_APPLICATION:
        /** TO-DO: implement loadAmalgamation(task) */
        break
      case FilingTypes.ANNUAL_REPORT:
        /** TO-DO: implement loadAnnualReport(task) --- What is the difference????? */
        break
      case FilingTypes.CHANGE_OF_ADDRESS:
        /** TO-DO: implement loadChangeOfAddress(task) */
        break
      case FilingTypes.CHANGE_OF_DIRECTORS:
        /** TO-DO: implement loadChangeOfDirectors(task) */
        break
      case FilingTypes.CHANGE_OF_REGISTRATION:
        /** TO-DO: implement loadChangeOfRegistration(task) */
        break
      case FilingTypes.CONSENT_CONTINUATION_OUT:
        /** TO-DO: implement loadConsentContinuationOut(task) */
        break
      case FilingTypes.CONTINUATION_OUT:
        /** TO-DO: implement loadContinuationOut(task) */
        break
      case FilingTypes.CONTINUATION_IN:
        /** TO-DO: implement loadContinuationInApplication(task) */
        break
      case FilingTypes.CONVERSION:
        /** TO-DO: implement loadConversion(task) */
        break
      case FilingTypes.CORRECTION:
        /** TO-DO: implement loadCorrection(task) */
        break
      case FilingTypes.DISSOLUTION:
        /** TO-DO: implement loadDissolution(task) */
        break
      case FilingTypes.INCORPORATION_APPLICATION:
        /** TO-DO: implement loadIncorporationApplication(task) */
        break
      case FilingTypes.REGISTRATION:
        /** TO-DO: implement loadRegistration(task) */
        break
      case FilingTypes.RESTORATION:
        /** TO-DO: implement loadRestoration(task) */
        break
      case FilingTypes.SPECIAL_RESOLUTION:
        /** TO-DO: implement loadSpecialResolution(task) */
        break
      default:
        console.error('ERROR - invalid name in filing header =', header)
        break
    }
  } else {
    console.error('ERROR - invalid header in filing =', filing)
  }

  return null
}

/**
 * Fetches affiliation invites tied to this entity.
 * @param authApiUrl
 * @param businessId the business identifier (aka entity inc no)
 * @param orgId org which has access rights to display (current logged in org)
 * @returns the axios response
 */
export const fetchAffiliationInvitations = async (authApiUrl: string, businessId: string, orgId: number) => {
  const url = `${authApiUrl}/affiliationInvitations`
  // return axios.get(url, { params: { toOrgId: orgId, businessIdentifier: businessId, statuses: 'PENDING' } })

  return await useBcrosFetch<{ affiliationInvitations: Array<AffiliationInvitationI> }>(url,
    { params: { toOrgId: orgId, businessIdentifier: businessId, statuses: 'PENDING' } })
    .then(({ data, error }) => {
      if (error.value || !data.value) {
        console.warn('fetchAffiliationInvitations() error - invalid response =', error?.value)
        throw new Error('Failed to fetch affiliation invitations')
      }
      return data?.value.affiliationInvitations
    })
}

/**
 * Authorizes or refuses authorization for this invitation.
 * @param authApiUrl
 * @param affiliationInvitationId id of affiliation to approve or not
 * @param isAuthorized boolean stating if invitation is authorized (true) or not authorized (false)
 * @returns the axios response
 */
export const authorizeAffiliationInvitation =
  async (authApiUrl: string, affiliationInvitationId: number, isAuthorized: boolean) => {
    const action = isAuthorized ? 'accept' : 'refuse'
    const authorizePath = `/affiliationInvitations/${affiliationInvitationId}/authorization/${action}`
    const url = authApiUrl + authorizePath

    return await useBcrosFetch<AffiliationInvitationI>(url, { method: 'PATCH' })
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('authorizeAffiliationInvitation() error - invalid response =', error?.value)
          throw new Error('failed to approve/refuse affiliationInvitation')
        }
        return data?.value
      })
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
