import { ADDRESSTYPES } from './constants'
import { bufToArray } from './util'
import ipaddr from 'ipaddr.js'

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
     * Regular expression for ipv4
     */
    const ipv4Regex =
      '^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$'

    /**
     * Regular expression for ipv6
     */
    const ipv6Regex =
      '(?!^(?:(?:.*(?:::.*::|:::).*)|::|[0:]+[01]|.*[^:]:|[0-9a-fA-F](?:.*:.*){8}[0-9a-fA-F]|(?:[0-9a-fA-F]:){1,6}[0-9a-fA-F])$)^(?:(::|[0-9a-fA-F]{1,4}:{1,2})([0-9a-fA-F]{1,4}:{1,2}){0,6}([0-9a-fA-F]{1,4}|::)?)$'

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
    if (this.host.match(ipv4Regex)) {
      this.type = 'ipv4'
    } else if (this.host.match(ipv6Regex)) {
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
    host: Buffer,
    port: Buffer,
    type: number
  ): Address {
    let addr
    if (type === ADDRESSTYPES.ipv6 || type === ADDRESSTYPES.ipv4) {
      addr = ipaddr.fromByteArray(bufToArray(host))
      addr = addr.toString()
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
        addr = Buffer.from(ipaddr.parse(this.host).toByteArray())
        break
      case 'ipv6':
        type = ADDRESSTYPES.ipv6
        addr = Buffer.from(ipaddr.parse(this.host).toByteArray())
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
