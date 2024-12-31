import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getAllTodos } from "../../businessLogic/todos.mjs"
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('todos')

export const handler = middy()
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true,
      origin: "*"
    })
  )
  .handler(async (event) => {
    logger.info('Processing event: ', event)

    const todos = await getAllTodos()

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
  })
