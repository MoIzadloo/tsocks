import Address from '../../helper/address'
import { SOCKSVERSIONS, ADDRESSTYPES, COMMANDS } from '../../helper/constants'

import * as socks4 from './socks4'
import { State } from './socks4'
import Authenticator from '../../auth/authenticator'

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
    this.firstByte = this.context.read(1)
  }

  /**
   * Parse request and changes the state properly
   * @returns void
   */
  reply(): void {
    let version = SOCKSVERSIONS.socks5
    if (
      this.firstByte?.readInt8() === SOCKSVERSIONS.socks5 &&
      this.context.options.socks5
    ) {
      this.transitionTo(new MethodSelectionState(this.context))
    } else if (
      this.firstByte?.readInt8() === SOCKSVERSIONS.socks4 &&
      this.context.options.socks4
    ) {
      version = SOCKSVERSIONS.socks4
      this.transitionTo(new socks4.RequestState(this.context))
    } else {
      this.context.socket.removeAllListeners('data')
      return
    }
    this.context.version = version
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
  private cmd?: number
  private dstAddr?: Buffer
  private dstPort?: Buffer
  private atype?: number

  /**
   * Parse request
   * @returns  void
   */
  parse(): void {
    const version = this.context.read(1).readInt8()
    if (version !== this.context.version) {
      this.context.socket.removeAllListeners('data')
      return
    }
    this.cmd = this.context.read(1).readInt8()
    this.context.read(1).readInt8()
    this.atype = this.context.read(1).readInt8()
    switch (this.atype) {
      case ADDRESSTYPES.ipv4:
        this.dstAddr = this.context.read(4)
        break
      case ADDRESSTYPES.ipv6:
        this.dstAddr = this.context.read(16)
        break
      default:
        this.dstAddr = this.context.read(this.context.read(1).readInt8())
        break
    }
    this.dstPort = this.context.read(2)
    this.context.address = Address.buffToAddrFactory(
      this.dstAddr,
      this.dstPort,
      this.atype
    )
  }

  /**
   * Executes proper request handler function and,
   * remove all data listeners of contexts socket
   * @returns void
   */
  reply() {
    this.context.socket.removeAllListeners('data')
    switch (this.cmd) {
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
