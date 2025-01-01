import { TodoDB } from '../dataLayer/todoDB.mjs'

const todoDB = new TodoDB()

export async function getAllTodos() {
  return todoDB.getAllTodos()
}

export async function createTodo(createTodoRequest, userId) {
  return await todoDB.createTodo(userId, createTodoRequest)
}

export async function todoExists(userId, todoId) {
  return await todoDB.todoExists(userId, todoId)
}

export async function updateTodo(userId, todoId, todoToUpdate) {
  await todoDB.updateTodo(userId, todoId, todoToUpdate)
}

export async function updateAttachmentUrl(userId, todoId, attachmentUrl) {
  await todoDB.updateAttachmentUrl(userId, todoId, attachmentUrl)
}

export async function deleteTodo(userId, todoId) {
  await todoDB.deleteTodo(userId, todoId)
}