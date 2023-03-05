import { handler } from '../../helper/handler'

/**
 * Default implementation of connect
 * @returns void
 */
export const associate = handler((info) => {
  console.log(info)
})
