import { StatusCodes } from 'http-status-codes'

export const useBcrosTasks = defineStore('bcros/tasks', () => {
  const currentTasks: Ref<TasksI> = ref({} as TasksI)
  const taskIdentifier: Ref<string> = computed(() =>
    currentTasks.value.tasks && currentTasks.value.tasks.length > 0
      ? (currentTasks.value.tasks[0].task.filing?.business.identifier ??
      currentTasks.value.tasks[0].task.todo?.business.identifier)
      : ''
  )
  const errors: Ref<ErrorI[]> = ref([])
  const apiURL = useRuntimeConfig().public.legalApiURL

  /** Return the tasks for the given identifier */
  async function getTasks (identifier: string, params?: object) {
    return await useBcrosFetch<TasksI>(`${apiURL}/businesses/${identifier}/tasks`, { params })
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
    const businessCached = currentTasks.value && identifier === taskIdentifier.value
    if (!businessCached || force) {
      currentTasks.value = await getTasks(identifier) || {} as TasksI
    }
  }

  return {
    currentTasks,
    loadTasks
  }
})
