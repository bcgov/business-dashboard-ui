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

  const authApiURL = useRuntimeConfig().public.authApiURL

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
      const affiliationInvitations =
        await fetchAffiliationInvitations(authApiURL, identifier, account.currentAccount.id)

      affiliationInvitations.forEach((affiliationInvitation) => {
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
