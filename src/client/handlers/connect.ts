import { handler } from '../../helper/handler'
import { COMMANDS } from '../../helper/constants'
import Request from '../../helper/request'
import Reply from '../../helper/reply'

/**
 * Handle connect request
 * @returns void
 */
export const connect = handler((info, socket, obfs, event, resolve, reject) => {
  const request = new Request(
    info.version,
    COMMANDS.connect,
    info.address,
    0,
    info.userId
  )
  socket.write(obfs.obfuscate(request.toBuffer()))
  socket.on('data', (data) => {
    const reply = Reply.from(obfs.deObfuscate(data))
    if (resolve && reject && obfs) {
      reply.promiseHandler(socket, obfs, resolve, reject)
    }
    socket.removeAllListeners('data')
  })
})
