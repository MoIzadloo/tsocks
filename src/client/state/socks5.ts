import { State } from '../../helper/state'
import Connection from '../../helper/connection'
import { COMMANDS } from '../../helper/constants'

/**
 * The MethodSelectionState negotiates
 * with the server about the proper authentication method
 * specific for socks5
 * @remarks
 * References: {@link https://www.rfc-editor.org/rfc/rfc1928#section-3}
 */
export class MethodSelectionState extends State {
  /**
   * The accepted authentication method by the server
   */
  private method?: Buffer

  /**
   * Parse server response
   * @returns void
   */
  parse(): void {
    this.context.read(1)
    this.method = this.context.read(1)
  }

  /**
   * Continues to authenticate procedure if the server has
   * Accepted the suggested authentication method
   * @returns void
   */
  reply(): void {
    this.context.handlers.auth
      .find((method) => {
        if (this.method && method) {
          return method.method === this.method.readInt8()
        }
      })
      ?.authenticate(this.context)
  }
}

export class RequestState extends State {
  /**
   * Corresponding handler function to the command type (Connect | bind | associate)
   */
  handler?: (connection: Connection) => void

  /**
   * Select the handler function from handlers
   */
  parse(): void {
    if (this.context.cmd) {
      this.context.socket.removeAllListeners('data')
      switch (this.context.cmd) {
        case COMMANDS.connect:
          this.handler = this.context.handlers.req.connect
          break
        case COMMANDS.bind:
          this.handler = this.context.handlers.req.bind
          break
        case COMMANDS.associate:
          this.handler = this.context.handlers.req.associate
          break
      }
    }
  }

  /**
   * Execute the handler function
   */
  reply(): void {
    if (this.handler) {
      this.handler(this.context)
    }
  }
}
