import { handler } from '../../helper/handler'
import Request from '../../helper/request'
import { COMMANDS, SOCKS4REPLY, SOCKS5REPLY } from '../../helper/constants'
import Reply from '../../helper/reply'

/**
 * Handle bind request
 * @returns void
 */
export const bind = handler((info, socket, event, resolve, reject) => {
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
    if (reject) {
      if (
        reply.rep !== SOCKS5REPLY.succeeded.code &&
        reply.rep !== SOCKS4REPLY.granted.code
      ) {
        let msg = ''
        msg += Object.values(reply.ver === 5 ? SOCKS5REPLY : SOCKS4REPLY).find(
          (rep) => {
            return rep.code === reply.rep
          }
        )?.msg
        reject(msg)
      }
    }
    if (resolve) {
      resolve({
        address: reply.addr,
        socket: socket,
        rsv: reply.rsv,
      })
    }
    socket.removeAllListeners('data')
  })
})
