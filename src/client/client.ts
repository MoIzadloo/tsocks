import net from 'net'
import Event from '../helper/event'
import Connection, { EventTypes } from '../helper/connection'
import * as handlers from './handlers/index'
import { Handlers } from '../helper/handlers'
import {
  handler as reqHandler,
  Handler,
  HandlerResolve,
} from '../helper/handler'
import Address from '../helper/address'
import { AuthMethod } from '../helper/authMethod'
import { COMMANDS } from '../helper/constants'
import Request from '../helper/request'
import { ObfsBuilder } from '../obfs/obfs'
import { none } from '../obfs'
import Authenticator from './auth/authenticator'

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

  public obfs: ObfsBuilder

  constructor(
    port: number,
    host: string,
    version: 4 | 5,
    obfs: ObfsBuilder,
    userId?: string
  ) {
    this.host = host
    this.port = port
    this.userId = userId
    this.version = version
    this.handlers = new Handlers({
      connect: handlers.connect,
      associate: handlers.associate,
      bind: handlers.bind,
    })
    this.obfs = obfs
    this.event = new Event<EventTypes>()
  }

  /**
   * The connector method establishes a TCP connection to the proxy server
   * @param port - Proxy server port
   * @param host - Proxy server host
   * @param cmd - Request command
   * @param resolve - This function fires after the server response
   * @param reject - This function fires after the server response if any error occurs
   * @param version - SOCKS version
   * @param userId - UserId for identification in SOCKS4
   */
  private connector(
    port: number,
    host: string,
    cmd: number,
    resolve: (value: HandlerResolve | PromiseLike<HandlerResolve>) => void,
    reject: (arg0: string) => void,
    version?: 4 | 5,
    userId?: string
  ) {
    const socket = net.connect(this.port, this.host)
    const connection = new Connection(
      this.event,
      socket,
      this.handlers,
      'CLIENT'
    )
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
    connection.request = new Request(ver, cmd, address, 0, id)
    connection.resolve = resolve
    connection.reject = reject
    connection.obfs = this.obfs(connection)
    connection.event.subscribeOnce('error', (err) => {
      reject(err.message)
    })
    return connection
  }

  /**
   * Sends a bind request
   * @param port - Target port
   * @param host - Target host address
   * @param version - Server protocol version
   * @returns void
   */
  bind(port: number, host: string, version?: 4 | 5, userId?: string) {
    return new Promise<HandlerResolve>((resolve, reject) => {
      const connection = this.connector(
        port,
        host,
        COMMANDS.bind,
        resolve,
        reject,
        version,
        userId
      )
      connection.socket.once('connect', () => {
        connection.obfs.handshake(() => {
          if (connection?.request?.ver === 5) {
            const authenticator = new Authenticator(connection)
            authenticator.authenticate()
          }
          if (connection?.request?.ver === 4) {
            if (connection?.request?.addr?.type === 'domain') {
              reject('The Address type is not supported')
            }
            connection.handlers.req.bind(connection)
          }
        })
      })
    })
  }

  /**
   * Sends an associate request
   * @param port - Target port
   * @param host - Target host address
   * @param version - Server protocol version
   * @returns void
   */
  associate(port: number, host: string, version?: 4 | 5) {
    return new Promise<HandlerResolve>((resolve, reject) => {
      if (version === 5 || (!version && this.version === 5)) {
        const connection = this.connector(
          port,
          host,
          COMMANDS.associate,
          resolve,
          reject,
          5
        )
        connection.socket.once('connect', () => {
          connection.obfs.handshake(() => {
            if (connection?.request?.ver === 5) {
              const authenticator = new Authenticator(connection)
              authenticator.authenticate()
            }
          })
        })
      } else {
        reject("SOCKS V4  doesn't support associate command")
      }
    })
  }

  /**
   * Sends a connect request
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
        COMMANDS.connect,
        resolve,
        reject,
        version,
        userId
      )
      connection.socket.once('connect', () => {
        connection.obfs.handshake(() => {
          if (connection?.request?.ver === 5) {
            const authenticator = new Authenticator(connection)
            authenticator.authenticate()
          }
          if (connection?.request?.ver === 4) {
            if (connection?.request?.addr?.type === 'domain') {
              reject('The Address type is not supported')
            }
            connection.handlers.req.connect(connection)
          }
        })
      })
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

  /**
   * Get the handler function, and update this.handlers.req
   * @param cmd - Specify handler type (connect | associate | bind)
   * @param handler - Emitted when new request appears
   * @returns Server
   */
  public useReq(cmd: keyof Handlers['req'], handler: Handler): Client {
    this.handlers.req[cmd] = reqHandler(handler)
    return this
  }

  /**
   * Get the handler function, and update this.handlers.obfs
   * @param handler - Emitted when new request appears
   * @returns Server
   */
  public useObfs(handler: ObfsBuilder): Client {
    this.obfs = handler
    return this
  }
}

/**
 * Open new connection and connect to server
 * @param port - Server port
 * @param host - Server address
 * @param version - Server protocol version
 * @param obfs - Obfuscation Method
 * @param userId - userId for identification in v4
 * @returns void
 */
export const connect = (
  port: number,
  host: string,
  version: 4 | 5,
  userId?: string
) => {
  return new Client(port, host, version, none(), userId)
}
