import { handler } from '../../helper/handler'
import { SOCKS5REPLY } from '../../helper/constants'
import Address from '../../helper/address'
import * as ip from 'ip'
import UdpRelay from '../../helper/udpRelay'
import Reply from '../../helper/reply'

/**
 * Default implementation of associate
 * @returns void
 */
export const associate = handler((info, socket, event) => {
  const relayPort = socket.address()
  let reply: Reply
  if ('port' in relayPort) {
    const relayHost =
      info.address.host === '127.0.0.1' ? '127.0.0.1' : ip.address('private')
    try {
      const relay = UdpRelay.getInstance(relayPort.port)
      event?.subscribeOnce('terminate', () => {
        relay.close()
      })
      const relayAddress = new Address(relayPort.port, relayHost)
      reply = new Reply(info.version, SOCKS5REPLY.succeeded.code, relayAddress)
      socket.write(reply.toBuffer())
    } catch {
      reply = new Reply(
        info.version,
        SOCKS5REPLY.generalFailure.code,
        info.address
      )
      socket.write(reply.toBuffer())
    }
  } else {
    reply = new Reply(
      info.version,
      SOCKS5REPLY.generalFailure.code,
      info.address
    )
    socket.write(reply.toBuffer())
  }
})
