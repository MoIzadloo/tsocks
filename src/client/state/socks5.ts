import { State } from '../../helper/state'
/**
 * The MethodSelectionState negotiates
 * with the client about the proper authentication method
 * specific for socks5
 * @remarks
 * References: {@link https://www.rfc-editor.org/rfc/rfc1928#section-3}
 */
export class MethodSelectionState extends State {
  /**
   * users' suggested authentication methods
   */
  private method?: Buffer

  /**
   * Parse request and extracts user suggested authentication methods
   * @returns void
   */
  parse() {
    this.context.read(1)
    this.method = this.context.read(1)
  }

  /**
   * Continues to authenticate procedure with authenticator class
   * @returns void
   */
  reply() {
    this.context.socket.removeAllListeners('data')
    this.context.handlers.auth
      .find((method) => {
        if (this.method && method) {
          return method.method === this.method.readInt8()
        }
      })
      ?.authenticate(this.context)
  }
}
