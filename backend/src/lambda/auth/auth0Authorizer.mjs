import jwt from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'
// import { getAuthCertificate } from './utils.mjs'

const logger = createLogger('auth')

const certificate = `
-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJW0oFIpQgEOb5MA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1obXZ2cDR3cnludDR4YTJuLnVzLmF1dGgwLmNvbTAeFw0yMzExMDkx
ODAwMzBaFw0zNzA3MTgxODAwMzBaMCwxKjAoBgNVBAMTIWRldi1obXZ2cDR3cnlu
dDR4YTJuLnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAMMkuyQEglUIvrqHU4LU/PE+9SviJmAClQ5JdHmF6I/dDxN0nV/CInw9wLZs
TcT/r0+XAL/IngTJjq38JGcc0b0BfsHyh3tiUEHroUTNIUClq+7hLwDJwPWRM+wH
b0wEl3IfUpvxvIRiWuncfRDZT8HKnTnVr1dCGRz1pDbhbHPAPFHx7ylXxBubQY5D
97zGdd1muX+vu8Ml9qF50oJJnanSk5pml7wMcoigPG2gw2P/hM97WM6hCS4NgicP
FofhpVWmR70jgzriAwFcXrsMmfvvKpwIrtDQvwjHbZbHpHRrDT108ZG9g+TYUKUh
JQl6h6lU1kg6JUwbu8s58QfT0xkCAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQU1ucbKvvaXChvshMOSg7bXpVG4UcwDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQBPq8ZVikeB9xoiBW+tXJQOYHh5p6OzCeRCNUdsbrex
2ad5+b7s8RKAgvlhmsQPxnZPcM3eeKjpduegMK3CFxH5NttSeAnobbadtdQN++fB
V8mbd9PZZRxLXHWtFFPanVIPmxaHwsIJ1a1pxnkc89g/ZBvY0UgO2zZB3b1gR2LD
X0gDL6rqyluRspOA5R0oJPYPdVgIGaOVwKntDGZwE0Ybqfd/GqUsHE3MJ6WpQMhQ
iVR87shz+sHJdgofEtXsVGHtH025CvPNnTZBxYy1Szc/K9zZcEWanE+8r6LZAjqT
JuttGAuzAzZSIXUKCMktMKt1v53/9rFw+gQCdSlfEoC6
-----END CERTIFICATE-----`

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)

  // const certificate = getAuthCertificate()
  return jwt.verify(token, certificate, { algorithms: ['RS256'] })
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
