import * as net from 'net'
import Reply from './reply'
import { SOCKS5REPLY } from './constants'
import { Info } from './handler'
import Address from './address'

/**
 *  Starts listening on a new TCP port and the proxy relays
 *  then remote host information back to the client. when another remote client connects
 *  on this port sends a notification that an incoming connection has been accepted to the
 *  initial client and a full duplex stream is now established to the initial client and
 *  the client that connected to that special port.
 */
class TcpRelay {
  /**
   * TCP socket
   */
  private tcpRelay: net.Server

  /**
   * Relays port
   */
  public port: number

  constructor(port: number, info: Info, socket: net.Socket) {
    this.port = port
    this.tcpRelay = net.createServer()
    this.tcpRelay.once('connection', (remoteSocket) => {
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
      remoteSocket.on('close', () => {
        this.close()
      })
      socket.pipe(remoteSocket)
      remoteSocket.pipe(socket)
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
