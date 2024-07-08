import { StatusCodes } from 'http-status-codes'

import {
  fetchAffiliationInvitations,
  buildTodoItemIfFromAffiliationInvitation,
  authorizeAffiliationInvitation
} from '~/utils/todo'

export const useBcrosTodos = defineStore('bcros/todos', () => {
  const _todosForIdentifier = ref('')
  const todos = ref([])
  const loading = ref(false)
  const errors = ref([])

  const legalApiURL = useRuntimeConfig().public.legalApiURL
  const authApiURL = useRuntimeConfig().public.authApiURL

  /** Return the business details for the given identifier */
  async function getFilings (identifier: string, params?: object) {
    return await useBcrosFetch<{ filings: [] }>(
      `${legalApiURL}/businesses/${identifier}/filings`,
      { params, dedupe: 'defer' }
    )
      .then(({ data, error }) => {
        if (error.value || !data.value) {
          console.warn('Error fetching business details for', identifier)
          errors.value.push({
            statusCode: error.value?.status || StatusCodes.INTERNAL_SERVER_ERROR,
            message: error.value?.data?.message,
            category: ErrorCategoryE.ENTITY_BASIC
          })
        }
        return data?.value?.filings || []
      })
  }

  const authorize = async (todoId: number, isAuthorized: boolean) => {
    try {

      const response = await authorizeAffiliationInvitation(authApiURL, todoId, isAuthorized)
      if (response.status !== AffiliationInvitationStatusE.PENDING) {
        const index = todos.value.findIndex(todo => todo.id === todoId)
        todos.value.splice(index, 1)
      }
    } catch (error) {
      errors.value.push(error?.message)
    }
  }

  const loadTodos = async (identifier: string) => {
    try {
      const account = useBcrosAccount()
      const affiliationInvitations = await fetchAffiliationInvitations(authApiURL, identifier, account.currentAccount.id)

      affiliationInvitations.forEach(affiliationInvitation => {
        // only active (pending) affiliation invitations are to be converted into todo item for now
        if (affiliationInvitation.type === AffiliationInvitationTypeE.REQUEST &&
          affiliationInvitation.status === AffiliationInvitationStatusE.PENDING) {
          const newTodo = buildTodoItemIfFromAffiliationInvitation(affiliationInvitation, todos.value.length)
          todos.value.push(newTodo)
        }
      })
      _todosForIdentifier.value = identifier
    } catch (error) {
      errors.value.push(error?.message)
    }
  }

  return {
    todos,
    loading,
    errors,

    authorize,
    loadTodos
  }
})
