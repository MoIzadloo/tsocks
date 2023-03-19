import { createServer } from './server/server'
import { connect } from './client/client'
import * as serverAuthMethods from './server/auth/methods'
import * as clientAuthMethods from './client/auth/methods'
import udpRelay from './helper/udpRelay'

const parseUdpFrame = udpRelay.parseUdpFrame
const createUdpFrame = udpRelay.createUdpFrame

export {
  createServer,
  connect,
  serverAuthMethods,
  clientAuthMethods,
  parseUdpFrame,
  createUdpFrame,
}
