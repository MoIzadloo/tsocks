import { handler } from '../handler'

/**
 * Default implementation of connect
 * @returns void
 */
export const associate = handler((info) => {
  console.log(info)
})
