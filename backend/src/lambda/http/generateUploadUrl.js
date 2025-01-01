import middy from '@middy/core'
import cors from '@middy/http-cors'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import httpErrorHandler from '@middy/http-error-handler'
import { v4 as uuidv4 } from 'uuid'
import { todoExists, updateAttachmentUrl } from '../../businessLogic/todos.mjs'
import { createLogger } from '../../utils/logger.mjs'
import { parseUserId } from '../auth/utils.mjs'

const bucketName = process.env.IMAGES_S3_BUCKET
const urlExpiration = parseInt(process.env.SIGNED_URL_EXPIRATION)

const logger = createLogger('todos')

const s3Client = new S3Client()

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
    const todoId = event.pathParameters.todoId

    const authorization = event.headers.Authorization
    const split = authorization.split(' ')
    const jwtToken = split[1]
    const userId = parseUserId(jwtToken)

    const validTodoId = await todoExists(userId, todoId)

    if (!validTodoId) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Todo does not exist' })
      }
    }

    const imageId = uuidv4()
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${imageId}`
    await updateAttachmentUrl(userId, todoId, attachmentUrl)
    const url = await getUploadUrl(imageId)

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ uploadUrl: url })
    }
  })

async function getUploadUrl(imageId) {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: imageId
  })
  const url = await getSignedUrl(s3Client, command, { expiresIn: urlExpiration })

  return url
}


