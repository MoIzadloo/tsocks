import net from 'net'
import Event from '../helper/event'
import Connection, { EventTypes } from '../helper/connection'
import * as handlers from './handlers/index'
import { Handlers } from '../helper/handlers'
import Authenticator from './auth/authenticator'
import Address from '../helper/address'

/**
 *  The Client class is responsible for creating a TCP socket connection,
 *  and communicate with a standard socks server
 */
export class Client {
  /**
   * Socks server host
   */
  private readonly host: string

  /**
   * Socks server port
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

  constructor(port: number, host: string) {
    this.host = host
    this.port = port
    this.handlers = new Handlers({
      connect: handlers.connect,
      associate: handlers.associate,
      bind: handlers.bind,
    })
    this.event = new Event<EventTypes>()
  }

  /**
   * Connect to the target host trough socks server
   * @param port - Target port
   * @param host - Target host address
   * @param version - Server protocol version
   * @param userId - userId for identification in v4
   * @returns void
   */
  connect(port: number, host: string, version: 4 | 5, userId?: string) {
    return new Promise<net.Socket>((resolve, reject) => {
      const socket = net.connect(this.port, this.host)
      const connection = new Connection(this.event, socket, this.handlers)
      connection.version = version
      connection.address = new Address(port, host)
      connection.resolve = resolve
      connection.reject = reject
      connection.userId = userId
      connection.event.subscribeOnce('error', (err) => {
        reject(err.message)
      })
      if (version === 5) {
        const authenticator = new Authenticator(connection)
        authenticator.authenticate()
      } else if (version === 4) {
        connection.handlers.req.connect(connection)
      }
    })
  }
}

/**
 * Open new connection and connect to server
 * @param port - Server port
 * @param host - Server address
 * @returns void
 */
export const connect = (port: number, host: string) => {
  return new Client(port, host)
}
