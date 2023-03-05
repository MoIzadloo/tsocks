import { handler } from '../../helper/handler'

/**
 * Default implementation of connect
 * @returns void
 */
export const bind = handler((info) => {
  console.log(info)
})
