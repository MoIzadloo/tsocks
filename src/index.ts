import { createServer } from './server/server'
import { connect } from './client/client'
import * as serverMethods from './server/auth/methods'
import * as clientMethods from './client/auth/methods'

const serverAuthMethods = {
  userPass: serverMethods.userPass,
  none: serverMethods.none,
}

const clinetAuthmethods = {
  userPass: clientMethods.userPass,
  none: clientMethods.none,
}

export { createServer, connect, serverAuthMethods, clinetAuthmethods }
