import { handler } from '../../helper/handler'
import { COMMANDS } from '../../helper/constants'
import Request from '../../helper/request'
import Reply from '../../helper/reply'

/**
 * Handle connect request
 * @returns void
 */
export const connect = handler((info, socket, event, resolve, reject) => {
  const request = new Request(
    info.version,
    COMMANDS.connect,
    info.address,
    0,
    info.userId
  )
  socket.write(request.toBuffer())
  socket.on('data', (data) => {
    const reply = Reply.from(data)
    if (resolve && reject) {
      reply.promiseHandler(socket, resolve, reject)
    }
    socket.removeAllListeners('data')
  })
})
