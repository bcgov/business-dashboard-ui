import { StatusCodes } from 'http-status-codes'
import { buildTodoItemFromTasks } from '~/utils/todo'
import {
  fetchAffiliationInvitations,
  buildTodoItemFromAffiliationInvitation,
  authorizeAffiliationInvitation
} from '~/utils/todo/affiliation'
import { useBcrosLegalApi } from '~/composables/useBcrosLegalApi'

export const useBcrosTodos = defineStore('bcros/todos', () => {
  const tasks: Ref<TasksI> = ref({} as TasksI)
  const taskIdentifier: Ref<string> = computed(() =>
    tasks.value.tasks && tasks.value.tasks.length > 0
      ? (tasks.value.tasks[0].task.filing?.business.identifier ??
      tasks.value.tasks[0].task.todo?.business.identifier)
      : ''
  )
  const _todosForIdentifier = ref('')
  const todos = ref([])
  const loading = ref(false)
  const errors = ref([])

  const loadAffiliationsError = ref([])
  const authorizeAffiliationsErrors = ref([])

  /** Response to an affiliation invitation, either accept or refuse */
  const authorize = async (todoId: number, isAuthorized: boolean) => {
    try {
      const response = await authorizeAffiliationInvitation(todoId, isAuthorized)
      if (response.status !== AffiliationInvitationStatusE.PENDING) {
        const index = todos.value.findIndex(todo => todo.id === todoId)
        todos.value.splice(index, 1)
      }
    } catch (error) {
      authorizeAffiliationsErrors.value.push(error?.message)
    }
  }

  /** load afflication invitations todo items for the given identifier */
  const loadAffiliations = async (identifier: string) => {
    try {
      const account = useBcrosAccount()
      const affiliationInvitations =
        await fetchAffiliationInvitations(identifier, account.currentAccount.id)

      affiliationInvitations.forEach((affiliationInvitation) => {
        // only active (pending) affiliation invitations are to be converted into todo item for now
        if (affiliationInvitation.type === AffiliationInvitationTypeE.REQUEST &&
          affiliationInvitation.status === AffiliationInvitationStatusE.PENDING) {
          const newTodo = buildTodoItemFromAffiliationInvitation(affiliationInvitation, todos.value.length)
          todos.value.push(newTodo)
        }
      })
      _todosForIdentifier.value = identifier
    } catch (error) {
      loadAffiliationsError.value.push(error?.message)
    }
  }

  /** Return the tasks for the given identifier */
  const getTasks = async (identifier: string, params?: object) => {
    return await useBcrosLegalApi().fetch<TasksI>(
      `/businesses/${identifier}/tasks`,
      { params, dedupe: 'defer' }
    )
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('Error fetching tasks for', identifier)
          errors.value.push({
            statusCode: error.value?.status || StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.value?.data?.message,
            category: ErrorCategoryE.ENTITY_BASIC
          })
        }
        return data.value
      })
  }

  const loadTasks = async (identifier: string, force = false) => {
    const { trackUiLoadingStart, trackUiLoadingStop } = useBcrosDashboardUi()
    trackUiLoadingStart('boostrapPendingFilingLoading')
    const businessCached = tasks.value && identifier === taskIdentifier.value
    if (!businessCached || force) {
      tasks.value = await getTasks(identifier) || {} as TasksI
      if (Array.isArray(tasks.value.tasks)) {
        for (const task of tasks.value.tasks) {
          const newTodo = await buildTodoItemFromTasks(task)
          if (newTodo) {
            todos.value.push(newTodo)
          } else {
            errors.value.push({ message: 'Failed to build todo item from task' })
          }
        }
      }
    } else {
      console.error('Expected tasks.value.tasks to be an array', tasks.value.tasks)
    }
    trackUiLoadingStop('boostrapPendingFilingLoading')
  }

  const loadBootstrapTask = async (task: TaskI) => {
    tasks.value = { tasks: [task] }
    const newTodo = await buildTodoItemFromTasks(task)

    if (newTodo) {
      // bootstrap cases need this overwritten
      if (newTodo.draftTitle) {
        newTodo.title = newTodo.draftTitle
      } else {
        newTodo.title = useBcrosBusinessBootstrap().bootstrapFilingDisplayName
      }
      // set todo
      todos.value = [newTodo]
    } else {
      errors.value.push({ message: 'Failed to build todo item from task' })
    }
  }

  const clearTodos = () => {
    todos.value = []
  }

  return {
    tasks,
    taskIdentifier,
    todos,
    loading,
    errors,
    loadAffiliationsError,
    authorizeAffiliationsErrors,
    authorize,
    loadAffiliations,
    loadBootstrapTask,
    loadTasks,
    clearTodos
  }
})
