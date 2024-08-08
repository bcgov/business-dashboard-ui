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
