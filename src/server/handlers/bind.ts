import { handler, Info } from '../../helper/handler'
import Reply from '../../helper/reply'
import * as ip from 'ip'
import Address from '../../helper/address'
import { SOCKS4REPLY, SOCKS5REPLY, SOCKSVERSIONS } from '../../helper/constants'
import TcpRelay from '../../helper/tcpRelay'
import * as tcpPortUsed from 'tcp-port-used'
import * as net from 'net'
import { EventTypes } from '../../index'
import Event from '../../helper/event'

/**
 * Default implementation of bind
 * @returns void
 */
export const bind = handler((info, socket, event) => {
  let relayPort = info.address.port
  if (relayPort === 0) {
    relayPort = randPort()
  }
  createRelay(relayPort, info, socket, event)
})

const randPort = () => {
  const max = 0
  const min = 32767
  const difference = max - min
  let rand = Math.random()
  rand = Math.floor(rand * difference)
  rand = rand + min
  return rand
}

const createRelay = (
  port: number,
  info: Info,
  socket: net.Socket,
  event?: Event<EventTypes>
) => {
  let version: number
  let reply: Reply
  if (info.version === SOCKSVERSIONS.socks5) {
    version = SOCKSVERSIONS.socks5
  } else {
    version = 1
  }
  tcpPortUsed
    .check(port)
    .then((inUse) => {
      if (inUse) {
        createRelay(randPort(), info, socket)
      } else {
        const relayHost =
          info.address.host === '127.0.0.1'
            ? '127.0.0.1'
            : ip.address('private')
        const relay = new TcpRelay(port, info, socket)
        event?.subscribeOnce('terminate', () => {
          relay.close()
        })
        const relayAddress = new Address(relay.port, relayHost)
        if (info.version === SOCKSVERSIONS.socks5) {
          reply = new Reply(version, SOCKS5REPLY.succeeded.code, relayAddress)
        } else if (info.version === SOCKSVERSIONS.socks4) {
          reply = new Reply(version, SOCKS4REPLY.granted.code, relayAddress)
        }
        socket.write(reply.toBuffer())
      }
    })
    .catch((err) => {
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
      socket.write(reply.toBuffer())
    })
}
