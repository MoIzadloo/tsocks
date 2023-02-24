import { createServer } from './server/server'
import { userPass, none } from './auth/methods'

const authMethods = {
  userPass,
  none,
}

export { createServer, authMethods }
