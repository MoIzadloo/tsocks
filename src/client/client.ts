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
   * Triggers whenever the socket initialized
   */
  private readonly connectionListener: (() => void) | undefined

  /**
   * The object which contains all default handlers
   */
  private readonly handlers: Handlers

  /**
   * The main event object
   */
  private readonly event: Event<EventTypes>

  constructor(
    port: number,
    host: string,
    connectionListener: (() => void) | undefined
  ) {
    this.host = host
    this.port = port
    this.handlers = new Handlers({
      connect: handlers.connect,
      associate: handlers.associate,
      bind: handlers.bind,
    })
    this.event = new Event<EventTypes>()
    this.connectionListener = connectionListener
  }

  /**
   * Connect to the target host trough socks server
   * @param port - Server port
   * @param host - Server address
   * @param version - Server protocol version
   * @returns void
   */
  connect(port: number, host: string, version: 4 | 5) {
    return new Promise<net.Socket>((resolve, reject) => {
      const socket = net.connect(this.port, this.host, this.connectionListener)
      const connection = new Connection(this.event, socket, this.handlers)
      connection.version = version
      connection.address = new Address(port, host)
      connection.resolve = resolve
      connection.reject = reject
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
 * @param connectionListener - Emitted when a new connection opens
 * @returns void
 */
export const connect = (
  port: number,
  host: string,
  connectionListener?: (() => void) | undefined
) => {
  return new Client(port, host, connectionListener)
}
