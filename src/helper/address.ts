import { ADDRESSTYPES } from './constants'
import * as ip from 'ip'

interface BuffIp {
  port: Buffer
  host: Buffer
  type: number
}

/**
 * The Address class turns buffer Address to string address and conversely
 */
class Address {
  public host: string
  public type: string
  public port: number

  constructor(port: number, host: string) {
    /**
     * Regular expression for domain
     */
    const domainRegex = '^[a-zA-Z0-9-\\_]+\\.[a-zA-Z]+?$'

    /**
     * Port
     */
    this.port = port

    /**
     * Host
     */
    this.host = host

    /**
     * Type (ipv4 | ipv6 | domain)
     */
    if (ip.isV4Format(this.host)) {
      this.type = 'ipv4'
    } else if (ip.isV6Format(this.host)) {
      this.type = 'ipv6'
    } else if (this.host.match(domainRegex)) {
      this.type = 'domain'
    } else {
      throw new Error('Invalid host address type')
    }
  }

  /**
   * A factory method which construct an Address instance from Buffer
   * @param host - Host Buffer
   * @param port - Port Buffer
   * @param type - type number
   * @returns Address
   */
  public static buffToAddrFactory(
    port: Buffer,
    host: Buffer,
    type: number
  ): Address {
    let addr
    if (type === ADDRESSTYPES.ipv6 || type === ADDRESSTYPES.ipv4) {
      addr = ip.toString(host)
    } else {
      addr = host.toString()
    }
    return new Address(port.readInt16BE(), addr)
  }

  /**
   * Turns Address instance to BuffIp
   * @returns BuffIp
   */
  public toBuffer(): BuffIp {
    let type: number
    let addr: Buffer
    switch (this.type) {
      case 'ipv4':
        type = ADDRESSTYPES.ipv4
        addr = ip.toBuffer(this.host)
        break
      case 'ipv6':
        type = ADDRESSTYPES.ipv6
        addr = ip.toBuffer(this.host)
        break
      default:
        type = ADDRESSTYPES.domain
        addr = Buffer.from(this.host)
        break
    }
    const buf = Buffer.allocUnsafe(2)
    buf.writeInt16BE(this.port, 0)
    return {
      port: buf,
      host: addr,
      type,
    }
  }
}

export default Address
