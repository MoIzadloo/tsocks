import { AUTHMODES } from '../../../helper/constants'
import { AuthMethod } from '../../../helper/authMethod'
import { RequestState } from '../../state/socks5'

/**
 * No authentication method
 * @returns AuthMethod
 */
export const none = (): AuthMethod => {
  return {
    method: AUTHMODES.none,
    authenticate: (connection) => {
      connection.transitionTo(new RequestState(connection))
      return true
    },
  }
}
