/**
 *  The Client class is responsible for creating a TCP socket connection,
 *  and communicate with a standard socks server
 */
import net from 'net'
import Event from '../helper/event'
import Connection, { EventTypes } from '../helper/connection'
import * as handlers from './handlers/index'
import { Handlers } from '../helper/handlers'
import Authenticator from './auth/authenticator'
import Address from '../helper/address'

export class Client {
  private readonly host: string
  private readonly port: number
  private readonly connectionListener: (() => void) | undefined
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
    const socket = net.connect(this.port, this.host, this.connectionListener)
    const connection = new Connection(
      this.event,
      socket,
      new Handlers({
        connect: handlers.connect,
        associate: handlers.associate,
        bind: handlers.bind,
      })
    )
    connection.version = version
    connection.address = new Address(port, host)
    if (version === 5) {
      const authenticator = new Authenticator(connection)
      authenticator.authenticate()
    }
    return socket
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
