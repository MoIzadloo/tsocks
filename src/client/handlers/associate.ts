import { handler } from '../../helper/handler'
import { COMMANDS } from '../../helper/constants'
import Request from '../../helper/request'
import Reply from '../../helper/reply'

/**
 * Handle udp associate request
 * @returns void
 */
export const associate = handler(
  (info, socket, obfs, event, resolve, reject) => {
    const request = new Request(info.version, COMMANDS.associate, info.address)
    socket.write(request.toBuffer())
    socket.removeAllListeners('data')
    socket.on('data', (data) => {
      const reply = Reply.from(data)
      if (resolve && reject && obfs) {
        reply.promiseHandler(socket, obfs, resolve, reject)
      }
      socket.removeAllListeners('data')
    })
  }
)
