import * as net from 'net'
import Reply from './reply'
import { SOCKS5REPLY } from './constants'
import { Info } from './handler'
import Address from './address'

class TcpRelay {
  /**
   * TCP socket
   */
  private tcpRelay: net.Server

  public port: number

  constructor(port: number, info: Info, socket: net.Socket) {
    this.port = port
    this.tcpRelay = net.createServer((remoteSocket) => {
      remoteSocket.on('data', (data) => {
        socket.write(data)
      })
    })
    this.tcpRelay.on('connection', (remoteSocket) => {
      const remote = remoteSocket.address()
      if ('port' in remote && 'address' in remote) {
        const relayAddress = new Address(remote.port, remote.address)
        const reply = new Reply(
          info.version,
          SOCKS5REPLY.succeeded.code,
          relayAddress
        )
        socket.write(reply.toBuffer())
      }
    })
    this.tcpRelay.listen(this.port, '127.0.0.1')
  }
  /**
   * Close Relay's socket
   * @param callback - Called when the socket has been closed
   */
  close(callback?: () => void) {
    this.tcpRelay.close(callback)
  }
}

export default TcpRelay
