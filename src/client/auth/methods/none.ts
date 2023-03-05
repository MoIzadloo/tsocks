import { AUTHMODES } from '../../../helper/constants'
import { AuthMethod } from '../../../helper/authMethod'

/**
 * No authentication method
 * @returns AuthMethod
 */
export const none = (): AuthMethod => {
  return {
    method: AUTHMODES.none,
    authenticate: (connection) => {
      connection.handlers.req.connect(connection)
    },
  }
}
