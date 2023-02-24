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

  constructor(port: number, host: string, type: string) {
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
    this.type = type.toLowerCase()
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
    let atype: 'ipv4' | 'ipv6' | 'domain'
    if (type === ADDRESSTYPES.ipv6 || type === ADDRESSTYPES.ipv4) {
      addr = ipaddr.fromByteArray(bufToArray(host))
      atype = addr.kind()
      addr = addr.toString()
    } else {
      addr = host.toString()
      atype = 'domain'
    }
    return new Address(port.readInt16BE(), addr, atype)
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
