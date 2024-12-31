import { decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('utils')
/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken) {
  const decodedJwt = decode(jwtToken)
  return decodedJwt.sub
}

export function getAuthCertificate() {
  try {
    const pemFilePath = path.resolve(import.meta.dirname, 'auth0.pem')
    const pemContent = fs.readFileSync(pemFilePath, 'utf8')

    // Match the certificate value
    const match = pemContent.match(/-----BEGIN CERTIFICATE-----\s([\s\S]+?)\s-----END CERTIFICATE-----/)

    if (match) {
      return pemContent
    } else {
      throw new Error('Certificate content not found in the file')
    }


  } catch (err) {
    logger.error('Error reading or parsing the PEM file:', err.message)
    return null
  }
}
