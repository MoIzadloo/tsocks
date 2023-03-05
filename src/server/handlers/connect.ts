import { handler } from '../../helper/handler'
import net from 'net'
import Address from '../../helper/address'
import { SOCKS5REPLY, SOCKSVERSIONS, SOCKS4REPLY } from '../../helper/constants'

/**
 * Default implementation of connect
 * @returns void
 */
export const connect = handler((info, socket) => {
  const connection = net.connect(info.address.port, info.address.host, () => {
    let addr = info.address
    if (
      connection.remotePort &&
      connection.remoteAddress &&
      connection.remoteFamily
    ) {
      addr = new Address(
        connection.remotePort,
        connection.remoteAddress,
        connection.remoteFamily
      )
    }
    if (info.version === SOCKSVERSIONS.socks5) {
      socket.write(
        Buffer.concat([
          Buffer.from([
            info.version,
            SOCKS5REPLY.succeeded,
            0x00,
            addr.toBuffer().type,
          ]),
          addr.toBuffer().host,
          addr.toBuffer().port,
        ])
      )
    } else if (info.version === SOCKSVERSIONS.socks4) {
      socket.write(
        Buffer.concat([
          Buffer.from([0x00, SOCKS4REPLY.succeeded]),
          addr.toBuffer().host,
          addr.toBuffer().port,
        ])
      )
    }
    socket.pipe(connection)
    connection.pipe(socket)
  })
  connection.on('error', (err) => {
    const addr = info.address
    let reply: number
    switch (err.message) {
      default:
        if (info.version === SOCKSVERSIONS.socks4) {
          reply = SOCKS4REPLY.connRefused
        } else {
          reply = SOCKS5REPLY.connRefused
        }
    }
    socket.write(
      Buffer.concat([
        Buffer.from([info.version, reply, 0x00, addr.toBuffer().type]),
        addr.toBuffer().host,
        addr.toBuffer().port,
      ])
    )
  })
})
