import { handler, Info } from '../../helper/handler'
import net from 'net'
import Address from '../../helper/address'
import { SOCKS5REPLY, SOCKSVERSIONS, SOCKS4REPLY } from '../../helper/constants'

/**
 * Default implementation of connect
 * @returns void
 */
export const connect = handler((info, socket) => {
  const connection = net.connect(info.address.port, info.address.host, () => {
    if (
      connection.remotePort &&
      connection.remoteAddress &&
      connection.remoteFamily
    ) {
      try {
      } catch (err) {
        if (info.version === 4) {
          doReply(socket, info, SOCKS4REPLY.rejected.code)
        } else {
          doReply(socket, info, SOCKS5REPLY.atypeNotSupported.code)
        }
        return
      }
    }
    if (info.version === SOCKSVERSIONS.socks5) {
      doReply(socket, info, SOCKS5REPLY.succeeded.code)
    } else if (info.version === SOCKSVERSIONS.socks4) {
      doReply(socket, info, SOCKS4REPLY.granted.code)
    }
    socket.pipe(connection)
    connection.pipe(socket)
  })
  connection.on('error', (err) => {
    let reply: number
    switch (err.message) {
      default:
        if (info.version === SOCKSVERSIONS.socks4) {
          reply = SOCKS4REPLY.rejected.code
        } else {
          reply = SOCKS5REPLY.generalFailure.code
        }
    }
    doReply(socket, info, reply)
  })
})

const doReply = (socket: net.Socket, info: Info, reply: number) => {
  const addr = info.address
  if (info.version === 4) {
    socket.write(
      Buffer.concat([
        Buffer.from([0x00, reply]),
        addr.toBuffer().host,
        addr.toBuffer().port,
      ])
    )
  } else {
    socket.write(
      Buffer.concat([
        Buffer.from([info.version, reply, 0x00, addr.toBuffer().type]),
        addr.toBuffer().host,
        addr.toBuffer().port,
      ])
    )
  }
}
