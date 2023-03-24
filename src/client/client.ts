import net from 'net'
import Event from '../helper/event'
import Connection, { EventTypes } from '../helper/connection'
import * as handlers from './handlers/index'
import { Handlers } from '../helper/handlers'
import { HandlerResolve } from '../helper/handler'
import Authenticator from './auth/authenticator'
import Address from '../helper/address'
import { AuthMethod } from '../helper/authMethod'
import { COMMANDS, SOCKSVERSIONS } from '../helper/constants'
import Request from '../helper/request'

/**
 *  The Client class is responsible for creating a TCP socket connection,
 *  and communicate with a standard SOCKS server
 */
export class Client {
  /**
   * SOCKS server host
   */
  private readonly host: string

  /**
   * SOCKS server port
   */
  private readonly port: number

  /**
   * The object which contains all default handlers
   */
  private readonly handlers: Handlers

  /**
   * The main event object
   */
  private readonly event: Event<EventTypes>

  /**
   * Server protocol version
   */
  private readonly version: 4 | 5

  /**
   * userId for identification in v4
   */
  private readonly userId?: string

  constructor(port: number, host: string, version: 4 | 5, userId?: string) {
    this.host = host
    this.port = port
    this.userId = userId
    this.version = version
    this.handlers = new Handlers({
      connect: handlers.connect,
      associate: handlers.associate,
      bind: handlers.bind,
    })
    this.event = new Event<EventTypes>()
  }

  private connector(
    port: number,
    host: string,
    resolve: (value: HandlerResolve | PromiseLike<HandlerResolve>) => void,
    reject: (arg0: string) => void,
    version?: 4 | 5,
    userId?: string
  ) {
    const socket = net.connect(this.port, this.host)
    const connection = new Connection(this.event, socket, this.handlers)
    const cmd = COMMANDS.connect
    let ver
    if (version) {
      ver = version
    } else {
      ver = this.version
    }
    const address = new Address(port, host)
    let id
    if (userId) {
      id = userId
    } else {
      id = this.userId
    }
    connection.request = new Request(ver, cmd, address)
    connection.resolve = resolve
    connection.reject = reject

    connection.event.subscribeOnce('error', (err) => {
      reject(err.message)
    })
    return connection
  }

  associate(port: number, host: string, version?: 4 | 5) {
    return new Promise<HandlerResolve>((resolve, reject) => {
      if (version === 5 || (!version && this.version === 5)) {
        const connection = this.connector(port, host, resolve, reject, 5)
        const authenticator = new Authenticator(connection)
        authenticator.authenticate()
      } else {
        reject("SOCKS V4  doesn't support associate command")
      }
    })
  }

  /**
   * Connect to the target host trough SOCKS server
   * @param port - Target port
   * @param host - Target host address
   * @param version - Server protocol version
   * @param userId - userId for identification in v4
   * @returns void
   */
  connect(port: number, host: string, version?: 4 | 5, userId?: string) {
    return new Promise<HandlerResolve>((resolve, reject) => {
      const connection = this.connector(
        port,
        host,
        resolve,
        reject,
        version,
        userId
      )
      if (connection?.request?.ver === 5) {
        const authenticator = new Authenticator(connection)
        authenticator.authenticate()
      } else if (connection?.request?.ver === 4) {
        if (connection?.request?.addr?.type === 'domain') {
          reject('The Address type is not supported')
        }
        connection.handlers.req.connect(connection)
      }
    })
  }

  /**
   * Get the handler function, and push it into this.handlers.req
   * @param handler - Emitted when the socks5 client sends an authentication request
   * @returns Client
   */
  public useAuth(handler: AuthMethod): Client {
    this.handlers.auth.push(handler)
    return this
  }
}

/**
 * Open new connection and connect to server
 * @param port - Server port
 * @param host - Server address
 * @param version - Server protocol version
 * @param userId - userId for identification in v4
 * @returns void
 */
export const connect = (
  port: number,
  host: string,
  version: 4 | 5,
  userId?: string
) => {
  return new Client(port, host, version, userId)
}
