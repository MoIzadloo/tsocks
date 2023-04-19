import * as net from 'net'
import Connection, { EventTypes, Options } from '../helper/connection'
import { Handler, handler as reqHandler } from '../helper/handler'
import { Handlers } from '../helper/handlers'
import { AuthMethod } from '../helper/authMethod'
import { connect, associate, bind } from './handlers'
import Event from '../helper/event'
import { ObfsBuilder } from '../obfs/obfs'

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
    this.handlers = new Handlers({
      connect,
      associate,
      bind,
    })
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
    this.socketServer.on('close', () => this.event.trigger('terminate'))
  }

  public on(event: 'data', callback: EventTypes['data']): void

  public on(event: 'error', callback: EventTypes['error']): void

  /**
   * Subscribe new event handler
   * @param event - event name
   * @param callback - Emitted event triggers
   * @returns Server
   */
  public on(event: never, callback: never): Server {
    this.event.subscribe(event, callback)
    return this
  }

  /**
   * Get the handler function, and push it into this.handlers.req
   * @param handler - Emitted when socks5 clients send an authentication request
   * @returns Server
   */
  public useAuth(handler: AuthMethod): Server {
    this.handlers.auth.push(handler)
    return this
  }

  /**
   * Get the handler function, and update this.handlers.req
   * @param cmd - Specify handler type (connect | associate | bind)
   * @param handler - Emitted when new request appears
   * @returns Server
   */
  public useReq(cmd: keyof Handlers['req'], handler: Handler): Server {
    this.handlers.req[cmd] = reqHandler(handler)
    return this
  }

  /**
   * Get the handler function, and update this.handlers.userId
   * @param handler - Emitted when new request appears specifically on socks4
   * @returns Server
   */
  public useIdent(handler: (userId: string) => boolean): Server {
    this.handlers.userId = handler
    return this
  }

  /**
   * Get the handler function, and update this.handlers.userId
   * @param handler - Emitted when new request appears
   * @returns Server
   */
  public useObfs(handler: ObfsBuilder): Server {
    this.handlers.obfs.push(handler)
    return this
  }

  /**
   * Get the primary's server handle, and listen on it
   * @param port - Port to listen on
   * @param host - Host to listen on
   * @param listeningListener - Emitted when new connection appears
   * @returns Server
   */
  public listen(
    port: number,
    host: string,
    listeningListener?: (() => void) | undefined
  ): Server {
    this.socketServer.listen(port, host, listeningListener)
    return this
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
 * Creates a new SOCKS server
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
