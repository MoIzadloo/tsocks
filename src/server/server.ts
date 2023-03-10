import * as net from 'net'
import Connection, { EventTypes, Options } from './connection'
import { Handler, handler as reqHandler } from './handlers/handler'
import { Handlers } from './handlers/handlers'
import { Method } from '../auth/methods/method'
import Event from '../helper/event'

type ConnectionListener = ((socket: net.Socket) => void) | undefined

/**
 *  The Server class is responsible for creating a TCP socket server,
 *  and listening for incoming connections and handling socks relevant requests
 */
export class Server {
  /**
   * The TCP socket server
   */
  private socketServer: net.Server

  /**
   * The array of all live connections
   */
  private connections: Connection[] = []

  /**
   * The object which contains all default handlers
   */
  private readonly handlers: Handlers

  /**
   * The main event object
   */
  private readonly event: Event<EventTypes>

  constructor(options?: Options, connectionListener?: ConnectionListener) {
    this.event = new Event<EventTypes>()
    this.handlers = new Handlers()
    this.event.subscribe('close', (conn) => {
      this.connections = this.connections.filter((item) => {
        return item !== conn
      })
    })
    this.socketServer = net.createServer((socket) => {
      const connection = new Connection(
        this.event,
        socket,
        this.handlers,
        options
      )
      this.connections.push(connection)
      connectionListener?.(socket)
    })
  }

  public on(event: 'data', callback: EventTypes['data']): void

  public on(event: 'error', callback: EventTypes['error']): void

  /**
   * Subscribe new event handler
   * @param event - event name
   * @param callback - Emitted event triggers
   * @returns void
   */
  public on(event: never, callback: never): void {
    this.event.subscribe(event, callback)
  }

  /**
   * Get the handler function, and push it into this.handlers.req
   * @param handler - Emitted when socks5 clients send an authentication request
   * @returns void
   */
  public useAuth(handler: Method): void {
    this.handlers.auth.push(handler)
  }

  /**
   * Get the handler function, and update this.handlers.req
   * @param cmd - Specify handler type (connect | associate | bind)
   * @param handler - Emitted when new request appears
   * @returns void
   */
  public useReq(cmd: keyof Handlers['req'], handler: Handler) {
    this.handlers.req[cmd] = reqHandler(handler)
  }

  /**
   * Get the handler function, and update this.handlers.userId
   * @param handler - Emitted when new request appears specifically on socks4
   * @returns void
   */
  public useIdent(handler: (userId: string) => boolean): void {
    this.handlers.userId = handler
  }

  /**
   * Get the primary's server handle, and listen on it
   * @param port - Port to listen on
   * @param host - Host to listen on
   * @param listeningListener - Emitted when new connection appears
   * @returns void
   */
  public listen(
    port: number,
    host: string,
    listeningListener?: (() => void) | undefined
  ) {
    this.socketServer.listen(port, host, listeningListener)
  }

  /**
   * Terminate connections and server
   * @param callback - Emitted when the server closes
   * @returns void
   */
  public close(
    callback?: ((err?: Error | undefined) => void) | undefined
  ): void {
    for (const connection of this.connections) {
      if (connection.isAlive()) {
        connection.close()
      }
    }
    this.socketServer.close(callback)
  }
}

/**
 * Creates a new Socks server
 * @param options - Optional inputs
 * @param connectionListener - Connection Listener
 * @returns Server
 */
export const createServer = (
  options?: Options,
  connectionListener?: ConnectionListener
): Server => {
  return new Server(options, connectionListener)
}
