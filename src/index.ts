import { createServer } from './server/server'
import { connect } from './client/client'
import { EventTypes } from './helper/connection'
import * as serverAuthMethods from './server/auth/methods'
import * as clientAuthMethods from './client/auth/methods'
import UdpRelay from './helper/udpRelay'
import Address from './helper/address'
import Request from './helper/request'
import Reply from './helper/reply'
import * as obfsMethods from './obfs/index'

const parseUdpFrame = UdpRelay.parseUdpFrame
const createUdpFrame = UdpRelay.createUdpFrame

export {
  createServer,
  connect,
  obfsMethods,
  serverAuthMethods,
  clientAuthMethods,
  parseUdpFrame,
  createUdpFrame,
  Address,
  EventTypes,
  Request,
  Reply,
}
