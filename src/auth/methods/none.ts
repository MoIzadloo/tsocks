import { AUTHMODES } from '../../helper/constants'
import { Method } from './method'
import { RequestState } from '../../server/state/socks5'

/**
 * No authentication method
 * @returns Method
 */
export const none = (): Method => {
  return {
    method: AUTHMODES.none,
    authenticate: (connection) => {
      connection.transitionTo(new RequestState(connection))
      return true
    },
  }
}
