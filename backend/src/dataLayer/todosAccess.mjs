import { DynamoDB, UpdateItemCommand, DeleteItemCommand } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import AWSXRay from 'aws-xray-sdk-core'
import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('temp')

export class TodoAccess {
  constructor(
    documentClient = AWSXRay.captureAWSv3Client(new DynamoDB()),
    todosTable = process.env.TODOS_TABLE,
    todosCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX
  ) {
    this.documentClient = documentClient
    this.todosTable = todosTable
    this.todosCreatedAtIndex = todosCreatedAtIndex
    this.dynamoDbClient = DynamoDBDocument.from(this.documentClient)
  }

  async getAllTodos() {
    const result = await this.dynamoDbClient.scan({
      TableName: this.todosTable
    })

    return result.Items
  }

  async createTodo(todo) {
    await this.dynamoDbClient.put({
      TableName: this.todosTable,
      Item: todo
    })

    return todo
  }

  async todoExists(todoId) {
    const result = await this.dynamoDbClient.get({
      TableName: this.todosTable,
      Key: { todoId }
    })
    return !!result.Item
  }

  async updateTodo(userId, todoId, todoToUpdate) {
    const command = new UpdateItemCommand({
      TableName: this.todosTable,
      "Key": {
        userId: { S: userId },
        todoId: { S: todoId },
      },
      UpdateExpression: "set name = :name, dueDate = :dueDate, done = :done",
      ExpressionAttributeValues: {
        ":name": { S: todoToUpdate.name },
        ":dueDate": { S: todoToUpdate.dueDate },
        ":done": { S: todoToUpdate.done },
      }
    })

    try {
      await this.documentClient.send(command)
      logger.info('UpdateItem succeeded:', JSON.stringify(data, null, 2))
    } catch (err) {
      logger.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2))
    }
  }

  async updateAttachmentUrl(userId, todoId, attachmentUrl) {
    const command = new UpdateItemCommand({
      TableName: this.todosTable,
      "Key": {
        userId: { S: userId },
        todoId: { S: todoId },
      },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
        ":attachmentUrl": { S: attachmentUrl },
      }
    })

    try {
      const data = await this.documentClient.send(command)
      logger.info('UpdateItem succeeded:', JSON.stringify(data, null, 2))
    } catch (err) {
      logger.error('Unable to update item. Error JSON:', JSON.stringify(err, null, 2))
    }
  }

  async deleteTodo(userId, todoId) {
    const input = {
      "Key": {
        userId: { S: userId },
        todoId: { S: todoId },
      },
      TableName: this.todosTable,
    }

    try {
      const command = new DeleteItemCommand(input)
      const response = await this.documentClient.send(command)
      logger.info('DeleteItem succeeded:', JSON.stringify(response, null, 2))
    } catch (err) {
      logger.error('Unable to delete item. Error JSON:', JSON.stringify(err, null, 2))
    }
  }
}
