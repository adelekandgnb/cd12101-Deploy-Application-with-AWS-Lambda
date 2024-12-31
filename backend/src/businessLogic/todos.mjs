import { v4 as uuidv4 } from "uuid"

import { TodoAccess } from '../dataLayer/todosAccess.mjs'

const todoAccess = new TodoAccess()

export async function getAllTodos() {
  return todoAccess.getAllTodos()
}

export async function createTodo(createTodoRequest, userId) {
  return await todoAccess.createTodo({
    todoId: uuidv4(),
    userId: userId,
    name: createTodoRequest.name,
    dueDate: createTodoRequest.dueDate,
    done: false,
    createdAt: new Date().toISOString()
  })
}

export async function todoExists(todoId) {
  return todoAccess.todoExists(todoId)
}

export async function updateTodo(userId, todoId, todoToUpdate) {
  return todoAccess.updateTodo(userId, todoId, todoToUpdate)
}

export async function updateAttachmentUrl(userId, todoId, attachmentUrl) {
  return todoAccess.updateAttachmentUrl(userId, todoId, attachmentUrl)
}

export async function deleteTodo(userId, todoId) {
  return todoAccess.deleteTodo(userId, todoId)
}