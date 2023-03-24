import * as net from 'net'
import { State } from './state'
import Readable from './readable'
import { IdentifierState } from '../server/state/socks5'
import Writable from './writable'
import { Handlers } from './handlers'
import { HandlerResolve } from './handler'
import Address from './address'
import Event from './event'
import Request from './request'

export type EventTypes = {
  data: (data: Buffer) => void
  error: (err: Error) => void
  close: (connection: Connection) => void
  terminate: () => void
}

export type Options = {
  socks5: boolean
  socks4: boolean
}

/**
 * The Connection class set up listeners and handles incoming data.
 * a new instance get constructed pre each connection
 */
class Connection {
  /**
   * Resolve function for client only
   */
  public resolve?: (value: PromiseLike<HandlerResolve> | HandlerResolve) => void

  /**
   * Reject function for client only
   */
  public reject?: (reason?: any) => void

  /**
   * Current state
   */
  private state: State = new IdentifierState(this)

  /**
   * Connection socket
   */
  public socket: net.Socket

  /**
   * Readable data
   */
  public readable: Readable = new Readable(Buffer.allocUnsafe(0))

  /**
   * Authentication and request handlers
   */
  public handlers: Handlers

  /**
   * Main event instance
   */
  public event: Event<EventTypes>

  /**
   * Server options
   */
  public options: Options = {
    socks5: true,
    socks4: true,
  }

  /**
   * UserId for socks4 client
   */
  userId?: string

  request?: Request

  constructor(
    event: Event<EventTypes>,
    socket: net.Socket,
    handlers: Handlers,
    options?: Options
  ) {
    this.handlers = handlers
    this.socket = socket
    this.event = event
    if (options) {
      this.options = options
    }
    socket.on('data', (data) => {
      try {
        this.readable = new Readable(data)
        this.parse()
        this.reply()
      } catch (err) {
        if (err instanceof Error) {
          this.event.trigger('error', err)
        }
      }
      this.event.trigger('data', data)
    })
    socket.on('error', (err) => {
      this.event.trigger('error', err)
    })
    socket.on('close', () => {
      this.event.trigger('close', this)
    })
  }

  /**
   * Writes the writable on the socket
   * @param writable - writable to write on socket
   * @returns void
   */
  public write(writable: Writable): void {
    this.socket.write(writable.toBuffer())
  }

  public cat(bytes?: number): Buffer {
    return this.readable.cat(bytes)
  }

  /**
   * Read n bytes of data
   * @param bytes - Number of bytes to be read from data
   * @returns Buffer
   */
  public read(bytes?: number): Buffer {
    return this.readable.read(bytes)
  }

  /**
   * Read from data until a specific bytes
   * @param value - Buffer in which the reading process continues until it appears
   * @returns Buffer
   */
  public readUntil(value: Buffer): Buffer {
    return this.readable.readUntil(value)
  }

  /**
   * Checks if the connection is alive
   * @returns void
   */
  public isAlive(): boolean {
    return this.socket.readyState !== 'closed'
  }

  /**
   * Closes the connection
   * @returns void
   */
  public close() {
    this.socket.end()
  }

  /**
   * Change state from one to other
   * @param state - The state to change to
   * @returns void
   */
  public transitionTo(state: State): void {
    this.state = state
  }

  /**
   * Parse request
   * @returns void
   */
  public parse(): void {
    this.state.parse()
  }

  /**
   * Reply to the user with a proper response
   * @returns void
   */
  public reply(): void {
    this.state.reply()
  }
}

export default Connection
