import { AUTHMODES } from '../../../helper/constants'
import { AuthMethod } from '../../../helper/authMethod'
import Connection from '../../../helper/connection'

/**
 * Extract user/pass from user authentication request and,
 * execute the handler function
 * @param handler - Check the authorization of user/pass
 * @returns AuthMethod
 */
export const userPass = (
  handler: (user: string, pass: string) => boolean
): AuthMethod => {
  return {
    method: AUTHMODES.userPass,
    authenticate: (connection: Connection) => {
      console.log('hey userPass')
    },
  }
}
