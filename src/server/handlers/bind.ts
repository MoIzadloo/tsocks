import { handler } from '../../helper/handler'

/**
 * Default implementation of bind
 * @returns void
 */
export const bind = handler((info) => {
  console.log(info)
})
