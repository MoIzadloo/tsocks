import { handler } from '../../helper/handler'

/**
 * Handle udp associate request
 * @returns void
 */
export const associate = handler((info) => {
  console.log(info)
})
