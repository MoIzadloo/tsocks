import * as dgram from 'dgram'
import Address from './address'
import * as Buffer from 'buffer'
import Writable from './writable'
import Readable from './readable'
import { ADDRESSTYPES } from './constants'

interface ParseUdpFrame {
  rsv: Buffer
  frag: number
  address: Address
  data: Buffer
}

/**
 * UdpRelay will create a UDP relay server,
 * and it happens only once because of the singleton design pattern
 */
class UdpRelay {
  /**
   * Save the instance for further use
   */
  private static instance: UdpRelay

  /**
   * Datagram socket
   */
  private udpRelay: dgram.Socket

  private constructor(port: number) {
    this.udpRelay = dgram.createSocket('udp4')
    this.udpRelay.on('message', (msg, crinfo) => {
      const parsedMsg = UdpRelay.parseUdpFrame(msg)
      if (parsedMsg.frag === 0) {
        const udpSocket = dgram.createSocket('udp4')
        udpSocket.on('message', (msg, srinfo) => {
          this.udpRelay.send(
            UdpRelay.createUdpFrame(
              new Address(srinfo.port, srinfo.address),
              msg
            ),
            crinfo.port,
            crinfo.address
          )
        })
        udpSocket.bind()
        udpSocket.send(
          parsedMsg.data,
          parsedMsg.address.port,
          parsedMsg.address.host
        )
      }
    })
    this.udpRelay.bind(port)
  }

  /**
   * The static method that controls the access to the UdpRelay instance
   * @param port - Port to bind socket to
   * @returns UdpRelay
   */
  public static getInstance(port: number): UdpRelay {
    if (!UdpRelay.instance) {
      UdpRelay.instance = new UdpRelay(port)
    }
    return UdpRelay.instance
  }

  /**
   * Creates a SOCKS UDP frame
   * @param address - The address to forward data to
   * @param data - The data to be forwarded
   * @param frag - The fragment number
   * @returns Buffer
   */
  public static createUdpFrame(
    address: Address,
    data: Buffer,
    frag = 0
  ): Buffer {
    const bufferAddr = address.toBuffer()
    const writeable = new Writable()
    writeable.push(0x00, 0x00)
    writeable.push(frag)
    writeable.push(bufferAddr.type)
    if (address.type === 'domain') {
      writeable.push(address.host.length)
    }
    writeable.push(bufferAddr.host)
    writeable.push(bufferAddr.port)
    writeable.push(data)
    return writeable.toBuffer()
  }

  /**
   * Parses a SOCKS UDP frame
   * @param buffer - data to be parse
   * @returns ParseUdpFrame
   */
  public static parseUdpFrame(buffer: Buffer): ParseUdpFrame {
    const readable = new Readable(buffer)
    const rsv = readable.read(2)
    const frag = readable.read(1).readInt8()
    const atype = readable.read(1).readInt8()
    let host
    switch (atype) {
      case ADDRESSTYPES.domain:
        const hostLength = readable.read(1).readInt8()
        host = readable.read(hostLength)
        break
      case ADDRESSTYPES.ipv6:
        host = readable.read(16)
        break
      default:
        host = readable.read(4)
        break
    }
    const port = readable.read(2)
    const address = Address.buffToAddrFactory(port, host, atype)
    const data = readable.read()
    return {
      rsv,
      frag,
      address,
      data,
    }
  }

  /**
   * Close Relay's socket
   * @param callback - Called when the socket has been closed
   */
  close(callback?: () => void) {
    this.udpRelay.close(callback)
  }
}

export default UdpRelay
