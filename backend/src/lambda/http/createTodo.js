import middy from '@middy/core'
import cors from '@middy/http-cors'
import httpErrorHandler from '@middy/http-error-handler'
import { parseUserId } from "../auth/utils.mjs"
import { createTodo } from "../../businessLogic/todos.mjs"
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

    const newTodo = JSON.parse(event.body)

    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    const userId = parseUserId(jwtToken)

    await createTodo(newTodo, userId)

    return {
      statusCode: 201,
      body: JSON.stringify({
        item: {
          name: newTodo.name,
          dueDate: newTodo.dueDate
        }
      })
    }
  })

