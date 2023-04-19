import { handler } from '../../helper/handler'
import net from 'net'
import { SOCKS5REPLY, SOCKSVERSIONS, SOCKS4REPLY } from '../../helper/constants'
import Reply from '../../helper/reply'
import Address from '../../helper/address'

/**
 * Default implementation of connect
 * @returns void
 */
export const connect = handler((info, socket, obfs) => {
  let version: number
  let reply: Reply
  if (info.version === SOCKSVERSIONS.socks5) {
    version = SOCKSVERSIONS.socks5
  } else {
    version = 0
  }
  const connection = net.connect(info.address.port, info.address.host, () => {
    if (connection.remotePort && connection.remoteAddress) {
      const address = new Address(
        connection.remotePort,
        connection.remoteAddress
      )
      if (info.version === SOCKSVERSIONS.socks5) {
        reply = new Reply(version, SOCKS5REPLY.succeeded.code, address)
      } else if (info.version === SOCKSVERSIONS.socks4) {
        reply = new Reply(version, SOCKS4REPLY.granted.code, address)
      }
      socket.write(obfs.obfuscate(reply.toBuffer()))
      socket.on('data', (data) => {
        connection.write(obfs.deObfuscate(data))
      })
      connection.on('data', (data) => {
        socket.write(obfs.obfuscate(data))
      })
    }
  })
  connection.on('error', (err) => {
    switch (err.message) {
      default:
        if (info.version === SOCKSVERSIONS.socks4) {
          reply = new Reply(version, SOCKS4REPLY.rejected.code, info.address)
        } else {
          reply = new Reply(
            version,
            SOCKS5REPLY.generalFailure.code,
            info.address
          )
        }
    }
    socket.write(obfs.obfuscate(reply.toBuffer()))
  })
})
