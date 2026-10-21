import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { FilingNames, FilingTypes } from '@bcrs-shared-components/enums'
import { DefaultRoles } from '../../test-utils'
import { useBcrosBusiness } from '../../../src/stores/business'
import { buildTodo } from '../../../src/utils/todo/task-todo'
import { doFileNow, doResumeFiling } from '../../../src/utils/todo/action-functions'
import { getMissingInfoCategories } from '../../../src/utils/todo/missing-info'
import { addSubtitleOrContent, getDraftTitle, getTitle } from '../../../src/utils/todo/task-filing/content-loader'
import { AuthorizedActionsE } from '../../../src/enums/authorized-actions-e'
import { WarningTypesE } from '../../../src/enums/warning-types-e'
import { TodoContentE } from '../../../src/enums/todo-content-e'

const { mockAuthorizedActions, mockGoToBusinessCorpsUI } = vi.hoisted(() => ({
  mockAuthorizedActions: { value: [] as string[] },
  mockGoToBusinessCorpsUI: vi.fn()
}))

// overrides the per-call useBcrosAccount mock from tests/setup.ts so authorized actions are shared
mockNuxtImport('useBcrosAccount', () => {
  return () => ({
    setAuthorizedActions: (actions: string[]) => { mockAuthorizedActions.value = actions },
    getAuthorizedActions: () => mockAuthorizedActions.value,
    verifyAccountAuthorizations: () => Promise.resolve(true),
    currentAccount: { id: 1 }
  })
})

// overrides the partial useBcrosNavigate mock from tests/setup.ts
mockNuxtImport('useBcrosNavigate', () => {
  return () => ({
    goToBcrosDashboard: vi.fn(),
    goToBusinessCorpsUI: mockGoToBusinessCorpsUI,
    goToFilingsUI: vi.fn(),
    goToEditUI: vi.fn(),
    goToCreateUI: vi.fn(),
    goToPersonRolesUI: vi.fn()
  })
})

const officeWarning = {
  code: 'NO_REGISTERED_OFFICE_DELIVERY_ADDRESS_POSTAL_CODE',
  message: 'Postal code is required for registered office delivery address.',
  warningType: WarningTypesE.MISSING_REQUIRED_BUSINESS_INFO,
  data: { officeType: 'registeredOffice' }
}
const recordsOfficeWarning = {
  code: 'NO_RECORDS_OFFICE',
  message: 'A records office is required.',
  warningType: WarningTypesE.MISSING_REQUIRED_BUSINESS_INFO,
  data: { officeType: 'recordsOffice' }
}
const directorWarning = {
  code: 'NO_DIRECTOR_MAILING_ADDRESS_STREET',
  message: 'Street is required for director mailing address.',
  warningType: WarningTypesE.MISSING_REQUIRED_BUSINESS_INFO,
  data: { partyId: 123 }
}
const otherWarning = {
  code: 'TRANSITION_NOT_FILED',
  message: 'Transition not filed.',
  warningType: WarningTypesE.NOT_IN_GOOD_STANDING
}

const reviewImportedDataTask = (status = 'NEW', enabled = true) => ({
  enabled,
  order: 1,
  task: {
    todo: {
      business: { identifier: 'BC0871427', legalType: 'BC' },
      header: { name: FilingTypes.REVIEW_IMPORTED_DATA, status }
    }
  }
} as any)

const setBusiness = (warnings: any[], allowed = true) => {
  const business = useBcrosBusiness()
  business.currentBusiness = {
    identifier: 'BC0871427',
    legalType: 'BC',
    state: 'ACTIVE',
    warnings,
    allowedActions: {
      filing: { filingTypes: allowed ? [{ name: FilingTypes.REVIEW_IMPORTED_DATA, displayName: 'x' }] : [] }
    }
  } as any
}

describe('Review Imported Data todo', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockAuthorizedActions.value = [...DefaultRoles]
    mockGoToBusinessCorpsUI.mockReset()
  })

  it('collapses missing info warnings to one bullet per category', () => {
    expect(getMissingInfoCategories([officeWarning, recordsOfficeWarning, directorWarning, otherWarning] as any))
      .toEqual(['Office address', 'Director address'])
    expect(getMissingInfoCategories([directorWarning] as any)).toEqual(['Director address'])
    expect(getMissingInfoCategories([recordsOfficeWarning] as any)).toEqual(['Office address'])
    expect(getMissingInfoCategories([otherWarning] as any)).toEqual([])
    expect(getMissingInfoCategories(undefined)).toEqual([])
  })

  it('categorizes by the warning data, not the code', () => {
    const unknownOfficeCode = { ...officeWarning, code: 'SOME_FUTURE_OFFICE_CHECK' }
    const noData = { ...directorWarning, data: undefined }
    expect(getMissingInfoCategories([unknownOfficeCode] as any)).toEqual(['Office address'])
    expect(getMissingInfoCategories([noData] as any)).toEqual([])
  })

  it('keeps the missing info content on a draft filing', () => {
    const draft = { name: FilingTypes.REVIEW_IMPORTED_DATA, status: 'DRAFT' } as any
    addSubtitleOrContent(draft)
    expect(draft.content).toBe(TodoContentE.REVIEW_IMPORTED_DATA)
    expect(draft.subtitle).toBe('DRAFT')
  })

  it('builds the todo item with title, bullets, content and enabled action button', () => {
    setBusiness([officeWarning, directorWarning])
    const todo = buildTodo(reviewImportedDataTask())

    expect(todo).not.toBeNull()
    expect(todo.name).toBe(FilingTypes.REVIEW_IMPORTED_DATA)
    expect(todo.title).toBe('Review your migrated information')
    expect(todo.content).toBe(TodoContentE.REVIEW_IMPORTED_DATA)
    expect(todo.expansionContent).toBeUndefined()
    expect(todo.warnings).toEqual(['Office address', 'Director address'])
    expect(todo.status).toBe('NEW')
    expect(todo.enabled).toBe(true)
    expect(todo.order).toBe(1)
    expect(todo.actionButton.label).toBe('Review now')
    expect(todo.actionButton.disabled).toBe(false)
    expect(todo.actionButton.actionFn).toBe(doFileNow)
  })

  it('disables the action button when the task is disabled', () => {
    setBusiness([officeWarning])
    const todo = buildTodo(reviewImportedDataTask('NEW', false))
    expect(todo.enabled).toBe(false)
    expect(todo.actionButton.disabled).toBe(true)
  })

  it('disables the action button when the filing is not in allowed actions', () => {
    setBusiness([officeWarning], false)
    const todo = buildTodo(reviewImportedDataTask())
    expect(todo.actionButton.disabled).toBe(true)
  })

  it('returns null when the user lacks the REVIEW_IMPORTED_DATA_FILING permission', () => {
    mockAuthorizedActions.value = DefaultRoles.filter(role => role !== AuthorizedActionsE.REVIEW_IMPORTED_DATA_FILING)
    setBusiness([officeWarning])
    expect(buildTodo(reviewImportedDataTask())).toBeNull()
  })

  it('launches the filing in Business Corps UI', () => {
    setBusiness([officeWarning])
    doFileNow(buildTodo(reviewImportedDataTask()))
    expect(mockGoToBusinessCorpsUI).toHaveBeenCalledWith('/review-imported-data/BC0871427')
  })

  it('resumes a draft filing in Business Corps UI', () => {
    setBusiness([officeWarning])
    doResumeFiling({ name: FilingTypes.REVIEW_IMPORTED_DATA, filingId: 12345 } as any)
    expect(mockGoToBusinessCorpsUI).toHaveBeenCalledWith('/review-imported-data/BC0871427', { draft: '12345' })
  })

  it('uses the Legal API display name for draft filing titles', () => {
    const filing = { header: { name: FilingTypes.REVIEW_IMPORTED_DATA, status: 'DRAFT' } } as any
    expect(getTitle(filing, 'BC Limited Company')).toBe(FilingNames.REVIEW_IMPORTED_DATA)
    expect(getDraftTitle(filing)).toBe(FilingNames.REVIEW_IMPORTED_DATA)
    expect(FilingNames.REVIEW_IMPORTED_DATA).toBe('Review Migrated Information')
  })
})
