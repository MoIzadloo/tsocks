import { COMMANDS, SOCKS4REPLY } from '../../helper/constants'
import { State } from '../../helper/state'
import Writable from '../../helper/writable'
import Request from '../../helper/request'

/**
 * The RequestState class is responsible to handle
 * the request for socks4 (connect | associate | bind)
 * @remarks
 * References: {@link https://www.openssh.com/txt/socks4.protocol}
 */
export class RequestState extends State {
  /**
   * Parse request
   * @returns void
   */
  parse(): void {
    this.context.request = Request.from(this.context.read())
  }

  /**
   * Executes proper request handler function and,
   * remove all data listeners of contexts socket
   * @returns void
   */
  reply() {
    if (
      this.context?.request?.userId &&
      !this.context.handlers.userId(this.context.request.userId.toString())
    ) {
      const writable = new Writable()
      writable.push(
        0x00,
        SOCKS4REPLY.identFail.code,
        this.context.request.addr.toBuffer().port,
        this.context.request.addr.toBuffer().host
      )
      this.context.write(writable)
    }
    this.context.socket.removeAllListeners('data')
    switch (this.context?.request?.cmd) {
      case COMMANDS.connect:
        this.context.handlers.req.connect(this.context)
        break
      case COMMANDS.associate:
        this.context.handlers.req.associate(this.context)
        break
      case COMMANDS.bind:
        this.context.handlers.req.bind(this.context)
        break
    }
  }
}
