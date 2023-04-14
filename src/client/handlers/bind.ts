import { handler } from '../../helper/handler'
import Request from '../../helper/request'
import { COMMANDS } from '../../helper/constants'
import Reply from '../../helper/reply'

/**
 * Handle bind request
 * @returns void
 */
export const bind = handler((info, socket, obfs, event, resolve, reject) => {
  const request = new Request(
    info.version,
    COMMANDS.bind,
    info.address,
    0,
    info.userId
  )
  socket.write(request.toBuffer())
  socket.on('data', (data) => {
    const reply = Reply.from(data)
    if (resolve && reject && obfs) {
      reply.promiseHandler(socket, obfs, resolve, reject)
    }
    socket.removeAllListeners('data')
  })
})
