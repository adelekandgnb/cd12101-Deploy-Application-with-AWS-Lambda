import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { getAllTodos } from "../../businessLogic/todos.mjs"
import { createLogger } from '../../utils/logger.mjs'
import { parseUserId } from '../auth/utils.mjs'

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

    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    const userId = parseUserId(jwtToken)

    const todos = await getAllTodos(userId)

    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
  })
