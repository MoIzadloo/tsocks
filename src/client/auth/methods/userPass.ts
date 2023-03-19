import { AUTHMODES } from '../../../helper/constants'
import { AuthMethod } from '../../../helper/authMethod'
import Connection from '../../../helper/connection'
import Writable from '../../../helper/writable'
import { State } from '../../../helper/state'
import { RequestState } from '../../state/socks5'

/**
 * Get the username and password from the user and,
 * Handle the authentication procedure
 * @param user - Username
 * @param pass - Password
 * @returns AuthMethod
 */
export const userPass = (user: string, pass: string): AuthMethod => {
  return {
    method: AUTHMODES.userPass,
    authenticate: (connection: Connection) => {
      const writeable = new Writable()
      writeable.push(
        0x01,
        user.length,
        Buffer.from(user),
        pass.length,
        Buffer.from(pass)
      )
      connection.write(writeable)
      connection.transitionTo(new UserPassReqState(connection))
    },
  }
}

class UserPassReqState extends State {
  /**
   * Authentication result
   */
  private status?: number

  /**
   * Parse authentication result
   */
  parse(): void {
    this.context.read(1)
    this.status = this.context.read(1).readInt8()
  }

  /**
   * Proceed to sending (connect | bind | associate) request
   */
  reply(): void {
    if (this.status !== 0x00) {
      if (this.context.reject) {
        this.context.reject('Wrong credentials supplied')
      }
      this.context.close()
    } else {
      this.context.transitionTo(new RequestState(this.context))
      this.context.parse()
      this.context.reply()
    }
  }
}
