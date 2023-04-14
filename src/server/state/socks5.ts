import { SOCKSVERSIONS, COMMANDS } from '../../helper/constants'
import Request from '../../helper/request'
import * as socks4 from './socks4'
import { State } from '../../helper/state'
import Authenticator from '../auth/authenticator'
import { Http, None } from '../../obfs'

export class ObfsState extends State {
  private obfsMethods = [new None(), new Http()]

  parse(): void {
    let message = this.context.cat()
    for (const method of this.obfsMethods) {
      if (method.check(message)) {
        message = method.DeObfuscate(message)
        this.context.obfs = method
        break
      }
    }
  }

  reply(): void {
    this.context.transitionTo(new IdentifierState(this.context))
    this.context.parse()
    this.context.reply()
  }
}

/**
 * The IdentifierState class identifies the version of the
 * protocol from the received data and changes the state properly
 */
export class IdentifierState extends State {
  /**
   * We identify the protocol version from the first byte
   */
  private firstByte?: Buffer

  /**
   * Parse request
   * @returns void
   */
  parse(): void {
    this.firstByte = this.context.cat(1)
  }

  /**
   * Parse request and changes the state properly
   * @returns void
   */
  reply(): void {
    if (
      this.firstByte?.readInt8() === SOCKSVERSIONS.socks5 &&
      this.context.options.socks5
    ) {
      this.transitionTo(new MethodSelectionState(this.context))
    } else if (
      this.firstByte?.readInt8() === SOCKSVERSIONS.socks4 &&
      this.context.options.socks4
    ) {
      this.transitionTo(new socks4.RequestState(this.context))
    } else {
      this.context.socket.removeAllListeners('data')
      return
    }
    this.context.parse()
    this.context.reply()
  }
}

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
  private methods: number[] = []

  /**
   * Parse request and extracts user suggested authentication methods
   * @returns void
   */
  parse() {
    this.context.read(1)
    const methodsNum = this.context.read(1).readInt8()
    for (let i = 0; i < methodsNum; i++) {
      this.methods.push(this.context.read(1).readInt8())
    }
  }

  /**
   * Continues to authenticate procedure with authenticator class
   * @returns void
   */
  reply() {
    const authenticator = new Authenticator(this.context, this.methods)
    authenticator.authenticate()
  }
}

/**
 * The RequestState class is responsible to handle
 * the request for socks5 (connect | associate | bind)
 * @remarks
 * References: {@link https://www.rfc-editor.org/rfc/rfc1928#section-4}
 */
export class RequestState extends State {
  /**
   * Parse request
   * @returns  void
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
    this.context.socket.removeAllListeners('data')
    switch (this.context.request?.cmd) {
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
