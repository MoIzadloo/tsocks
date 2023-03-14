import { handler } from '../../helper/handler'

/**
 * Handle bind request
 * @returns void
 */
export const bind = handler((info) => {
  console.log(info)
})
