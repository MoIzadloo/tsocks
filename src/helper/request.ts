import Address from './address'
import Readable from './readable'
import { ADDRESSTYPES, SOCKSVERSIONS } from './constants'
import Writable from './writable'

class Request {
  /**
   * Protocol version
   */
  public ver: number

  /**
   * The request command
   **/
  public cmd: number

  /**
   * Desired destination address
   */
  public addr: Address

  /**
   * RESERVED
   */
  public rsv: number

  /**
   * UserId for SOCKS4 identification
   */
  public userId?: string

  constructor(
    ver: number,
    cmd: number,
    addr: Address,
    rsv = 0,
    userId?: string
  ) {
    this.ver = ver
    this.cmd = cmd
    this.rsv = rsv
    this.addr = addr
    this.userId = userId
  }

  /**
   * Conversions the Request object to Buffer
   */
  public toBuffer() {
    const writeable = new Writable()
    const buffAddr = this.addr.toBuffer()
    let host = buffAddr.host
    if (this.addr.type === 'domain') {
      host = Buffer.concat([Buffer.from([this.addr.host.length]), host])
    }
    writeable.push(this.ver, this.cmd)
    if (this.ver === SOCKSVERSIONS.socks5) {
      writeable.push(this.rsv, buffAddr.type, host, buffAddr.port)
    } else {
      writeable.push(buffAddr.port, host)
      if (this.userId) {
        writeable.push(Buffer.from(this.userId))
      }
      writeable.push(0x00)
    }
    return writeable.toBuffer()
  }

  /**
   * Conversions Buffer to the Request object
   */
  public static from(data: Buffer) {
    const readable = new Readable(data)
    const ver = readable.read(1).readInt8()
    const cmd = readable.read(1).readInt8()
    let dstAddr
    let dstPort
    let atype
    let rsv
    let userId
    if (ver === SOCKSVERSIONS.socks5) {
      rsv = readable.read(1).readInt8()
      atype = readable.read(1).readInt8()
      switch (atype) {
        case ADDRESSTYPES.ipv4:
          dstAddr = readable.read(4)
          break
        case ADDRESSTYPES.ipv6:
          dstAddr = readable.read(16)
          break
        default:
          dstAddr = readable.read(readable.read(1).readInt8())
          break
      }
      dstPort = readable.read(2)
    } else {
      dstPort = readable.read(2)
      dstAddr = readable.read(4)
      userId = readable.readUntil(-1).toString()
      atype = ADDRESSTYPES.ipv4
    }
    const addr = Address.buffToAddrFactory(dstPort, dstAddr, atype)
    return new Request(ver, cmd, addr, rsv, userId)
  }
}

export default Request
