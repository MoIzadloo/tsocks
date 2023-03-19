import { handler } from '../../helper/handler'
import { SOCKS5REPLY } from '../../helper/constants'
import Address from '../../helper/address'
import * as ip from 'ip'
import UdpRelay from '../../helper/udpRelay'

/**
 * Default implementation of associate
 * @returns void
 */
export const associate = handler((info, socket) => {
  const relayPort = socket.address()
  if ('port' in relayPort) {
    const relayHost =
      info.address.host === '127.0.0.1' ? '127.0.0.1' : ip.address('private')
    try {
      UdpRelay.getInstance(relayPort.port, () => {
        const relayAddress = new Address(relayPort.port, relayHost)
        socket.write(
          Buffer.concat([
            Buffer.from([
              info.version,
              SOCKS5REPLY.succeeded.code,
              0x00,
              relayAddress.toBuffer().type,
            ]),
            relayAddress.toBuffer().host,
            relayAddress.toBuffer().port,
          ])
        )
      })
    } catch {
      socket.write(
        Buffer.concat([
          Buffer.from([
            info.version,
            SOCKS5REPLY.generalFailure.code,
            0x00,
            info.address.toBuffer().type,
          ]),
          info.address.toBuffer().host,
          info.address.toBuffer().port,
        ])
      )
    }
  } else {
    socket.write(
      Buffer.concat([
        Buffer.from([
          info.version,
          SOCKS5REPLY.generalFailure.code,
          0x00,
          info.address.toBuffer().type,
        ]),
        info.address.toBuffer().host,
        info.address.toBuffer().port,
      ])
    )
  }
})
