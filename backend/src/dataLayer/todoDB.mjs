import AWSXRay from 'aws-xray-sdk-core'
import {
  ScanCommand,
  GetItemCommand,
  PutItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  DynamoDBClient
} from '@aws-sdk/client-dynamodb'
import { v4 as uuidv4 } from "uuid"
import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('update-todo')

export class TodoDB {
  constructor(
    client = AWSXRay.captureAWSv3Client(new DynamoDBClient({})),
    todosTable = process.env.TODOS_TABLE,
    todosCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX
  ) {
    this.client = client
    this.todosTable = todosTable
    this.todosCreatedAtIndex = todosCreatedAtIndex
  }

  async getAllTodos() {
    const command = new ScanCommand({
      TableName: this.todosTable
    })

    const response = await this.client.send(command)

    return response.Items
  }

  async createTodo(userId, createTodoRequest) {
    const command = new PutItemCommand({
      TableName: this.todosTable,
      Item: {
        todoId: { S: uuidv4() },
        userId: { S: userId },
        name: { S: createTodoRequest.name },
        dueDate: { S: createTodoRequest.dueDate },
        done: { BOOL: false },
        createdAt: { S: new Date().toISOString() }
      }
    })

    await this.client.send(command)

    return createTodoRequest
  }

  async todoExists(userId, todoId) {
    const command = new GetItemCommand({
      TableName: this.todosTable,
      Key: {
        userId: { S: userId },
        todoId: { S: todoId },
      }
    })

    const response = await this.client.send(command)
    return !!response.Item
  }

  async updateTodo(userId, todoId, todoToUpdate) {
    const command = new UpdateItemCommand({
      TableName: this.todosTable,
      Key: {
        userId: { S: userId },
        todoId: { S: todoId },
      },
      ExpressionAttributeNames: {
        "#n": "name"
      },
      UpdateExpression: "set #n = :name, dueDate = :dueDate, done = :done",
      ExpressionAttributeValues: {
        ":name": { S: todoToUpdate.name },
        ":dueDate": { S: todoToUpdate.dueDate },
        ":done": { BOOL: todoToUpdate.done },
      },
      ReturnValues: "ALL_NEW",
    })

    await this.client.send(command)
  }

  async updateAttachmentUrl(userId, todoId, attachmentUrl) {
    const command = new UpdateItemCommand({
      TableName: this.todosTable,
      Key: {
        userId: { S: userId },
        todoId: { S: todoId },
      },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
        ":attachmentUrl": { S: attachmentUrl },
      },
      ReturnValues: "ALL_NEW",
    })

    await this.client.send(command)
  }

  async deleteTodo(userId, todoId) {
    const command = new DeleteItemCommand({
      TableName: this.todosTable,
      Key: {
        userId: { S: userId },
        todoId: { S: todoId },
      }
    })

    await this.client.send(command)
  }
}