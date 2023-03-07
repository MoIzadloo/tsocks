import { handler } from '../../helper/handler'
import Writable from '../../helper/writable'
import { Readable } from '../../helper/readable'
import { COMMANDS, SOCKS4REPLY, SOCKS5REPLY } from '../../helper/constants'

/**
 * Handle connect request
 * @returns void
 */
export const connect = handler((info, socket, resolve, reject) => {
  const writeable = new Writable()
  writeable.push(info.version)
  if (info.version === 5) {
    const addressBuff = info.address.toBuffer()
    if (info.address.type === 'domain') {
      writeable.push(
        COMMANDS.connect,
        0x00,
        addressBuff.type,
        addressBuff.host.length,
        addressBuff.host,
        addressBuff.port
      )
    } else {
      writeable.push(
        COMMANDS.connect,
        0x00,
        addressBuff.type,
        addressBuff.host,
        addressBuff.port
      )
    }
  } else if (info.version === 4) {
    const addressBuff = info.address.toBuffer()
    writeable.push(
      COMMANDS.connect,
      Buffer.concat([addressBuff.port, addressBuff.host, Buffer.from([0x00])])
    )
  }
  socket.write(writeable.toBuffer())
  socket.on('data', (data) => {
    const readable = new Readable(data)
    const version = readable.read(1)
    const reply = readable.read(1)
    if (reject) {
      if (
        reply.readInt8() !== SOCKS5REPLY.succeeded.code &&
        reply.readInt8() !== SOCKS4REPLY.granted.code
      ) {
        let msg = ''
        msg += Object.values(
          version.readInt8() === 5 ? SOCKS5REPLY : SOCKS4REPLY
        ).find((rep) => {
          return rep.code === reply.readInt8()
        })?.msg
        reject(msg)
      }
    }
    if (resolve) {
      resolve(socket)
    }
    socket.removeAllListeners('data')
  })
})
