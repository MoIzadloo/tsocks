import { ADDRESSTYPES, COMMANDS } from '../../helper/constants'
import Address from '../../helper/address'
import { State } from '../../helper/state'

/**
 * The RequestState class is responsible to handle
 * the request for socks4 (connect | associate | bind)
 * @remarks
 * References: {@link https://www.openssh.com/txt/socks4.protocol}
 */
export class RequestState extends State {
  /**
   * Command (connect | associate | bind)
   */
  private cmd?: number

  /**
   * Destination address
   */
  private dstAddr?: Buffer

  /**
   * Destination port
   */
  private dstPort?: Buffer

  /**
   * Specific for socks4 authentication and identification
   */
  private userId?: Buffer

  /**
   * Parse request
   * @returns void
   */
  parse(): void {
    this.cmd = this.context.read(1).readInt8()
    this.dstPort = this.context.read(2)
    this.dstAddr = this.context.read(4)
    this.context.address = Address.buffToAddrFactory(
      this.dstAddr,
      this.dstPort,
      ADDRESSTYPES.ipv4
    )
    this.userId = this.context.readUntil(Buffer.from([0x00]))
    if (!this.context.handlers.userId(this.userId.toString())) {
      this.context.close()
    }
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
