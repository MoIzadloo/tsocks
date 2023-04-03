import Address from './address'
import Readable from './readable'
import {
  ADDRESSTYPES,
  SOCKS4REPLY,
  SOCKS5REPLY,
  SOCKSVERSIONS,
} from './constants'
import Writable from './writable'
import { HandlerResolve } from './handler'
import * as net from 'net'

class Replay {
  public ver: number
  public rep: number
  public addr: Address
  public rsv: number

  constructor(ver: number, rep: number, addr: Address, rsv = 0) {
    this.ver = ver
    this.rep = rep
    this.rsv = rsv
    this.addr = addr
  }

  public toBuffer() {
    const writeable = new Writable()
    const buffAddr = this.addr.toBuffer()
    let host = buffAddr.host
    if (this.addr.type === 'domain') {
      host = Buffer.concat([Buffer.from([this.addr.host.length]), host])
    }
    writeable.push(this.ver, this.rep)
    if (this.ver === SOCKSVERSIONS.socks5) {
      writeable.push(this.rsv, buffAddr.type, host, buffAddr.port)
    } else {
      writeable.push(buffAddr.port, host)
    }
    return writeable.toBuffer()
  }

  public static from(data: Buffer) {
    const readable = new Readable(data)
    const ver = readable.read(1).readInt8()
    const rep = readable.read(1).readInt8()
    let dstAddr
    let dstPort
    let atype
    let rsv
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
      atype = ADDRESSTYPES.ipv4
    }
    const addr = Address.buffToAddrFactory(dstPort, dstAddr, atype)
    return new Replay(ver, rep, addr, rsv)
  }

  promiseHandler(
    socket: net.Socket,
    resolve: (value: PromiseLike<HandlerResolve> | HandlerResolve) => void,
    reject: (reason?: any) => void
  ) {
    if (reject) {
      if (
        this.rep !== SOCKS5REPLY.succeeded.code &&
        this.rep !== SOCKS4REPLY.granted.code
      ) {
        let msg = ''
        msg += Object.values(this.ver === 5 ? SOCKS5REPLY : SOCKS4REPLY).find(
          (rep) => {
            return rep.code === this.rep
          }
        )?.msg
        reject(msg)
      }
    }
    if (resolve) {
      resolve({
        address: this.addr,
        socket: socket,
        rsv: this.rsv,
      })
    }
  }
}

export default Replay
