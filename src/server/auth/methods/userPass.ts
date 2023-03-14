import { AUTHMODES } from '../../../helper/constants'
import { AuthMethod } from '../../../helper/authMethod'
import Connection from '../../../helper/connection'
import { State } from '../../../helper/state'
import { RequestState } from '../../state/socks5'

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
      const authState = new UserPassReqState(connection)
      authState.handler = handler
      connection.transitionTo(authState)
    },
  }
}

/**
 * The UserPassReqState class negotiates with the user and,
 * authenticates the user's credentials
 * @remarks
 * References: {@link https://www.rfc-editor.org/rfc/rfc1929}
 */
class UserPassReqState extends State {
  /**
   * Handler function
   */
  public handler?: (user: string, pass: string) => boolean

  /**
   * Socks version
   */
  private version?: Buffer

  /**
   * Username
   */
  private username?: string

  /**
   * Password
   */
  private password?: string

  /**
   * Parse request
   * @returns void
   */
  parse(): void {
    this.version = this.context.read(1)
    const ulen = this.context.read(1)
    this.username = this.context.read(ulen.readInt8()).toString()
    const plen = this.context.read(1)
    this.password = this.context.read(plen.readInt8()).toString()
  }

  /**
   * Reply to the user with a proper response
   * @returns void
   */
  reply(): void {
    if (this.handler && this.username && this.password && this.version) {
      if (this.handler(this.username.toString(), this.password.toString())) {
        this.context.socket.write(Buffer.from([this.version.readInt8(), 0x00]))
        this.context.transitionTo(new RequestState(this.context))
      } else {
        this.context.socket.write(Buffer.from([this.version.readUInt8(), 0xff]))
        this.context.close()
      }
    }
  }
}
