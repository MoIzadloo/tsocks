import { handler } from '../../helper/handler'
import Writable from '../../helper/writable'
import { COMMANDS } from '../../helper/constants'

/**
 * Default implementation of connect
 * @returns void
 */
export const connect = handler((info, socket) => {
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
    socket.write(writeable.toBuffer())
    socket.on('data', (data) => {
      console.log(data)
      socket.removeAllListeners('data')
    })
  }
})
