import ObfsMethod from './obfs'
import Connection from '../helper/connection'
import { encryptionMethods, compressionMethods } from '../helper/constants'
import crypto from 'crypto'
import Writable from '../helper/writable'
import { IdentifierState } from '../server/state/socks5'
import { State } from '../helper/state'

/**
 * The HandShake class performs the handshake process
 */
class HandShake extends State {
  public callback?: () => void
  private handshakeResponse: string
  constructor(context: Connection, callback?: () => void) {
    super(context)
    this.callback = callback
    this.handshakeResponse = ''
  }
  parse(): void {
    if (this.context.type === Connection.CLIENT) {
    } else {
      const data = this.context.read().toString()
      const secWebSocketKey = data.match(/Sec-WebSocket-Key: (.*)/)?.[1]?.trim()
      const acceptKey = this.createAcceptKey(secWebSocketKey)
      this.handshakeResponse =
        `HTTP/1.1 101 Switching Protocols\r\n` +
        `Upgrade: websocket\r\n` +
        `Connection: Upgrade\r\n` +
        `Sec-WebSocket-Accept: ${acceptKey}\r\n\r\n`
    }
  }

  reply(): void {
    if (this.context.type === Connection.CLIENT) {
      this.context.obfs.handshakeFlag = true
      if (this.callback) {
        this.callback()
      }
    } else {
      this.context.transitionTo(new IdentifierState(this.context))
      this.context.obfs.handshakeFlag = true
      const writable = new Writable()
      writable.push(Buffer.from(this.handshakeResponse))
      this.context.write(writable)
    }
  }

  /**
   * Utility to create Sec-WebSocket-Accept header value from the client key.
   * @param key - The Sec-WebSocket-Key from the client.
   * @returns The WebSocket accept key for the server response.
   */
  private createAcceptKey(key: string | undefined): string {
    const GUID = '258EAFA5-E914-47DA-95CA-C5AB0DC85B11'
    return crypto
      .createHash('sha1')
      .update(key + GUID)
      .digest('base64')
  }
}

/**
 * The WebSocket class is an obfuscation method based on the
 * WebSocket protocol.
 */
class WebSocket extends ObfsMethod {
  public path: string
  public name = 'WebSocket'
  public encryption: string
  public compression: string
  public handshakeFlag: boolean

  constructor(
    connection: Connection,
    path = '/',
    compression: string = compressionMethods.none,
    encryption: string = encryptionMethods.none
  ) {
    super(connection)
    this.path = path
    this.handshakeFlag = false
    this.compression = compression
    this.encryption = encryption
  }

  /**
   * Checks if the incoming message matches the expected WebSocket format.
   * @param message - The incoming message.
   * @returns Whether the message matches the WebSocket format.
   */
  check(message: Buffer): boolean {
    const messageStr = message.toString()
    return messageStr.includes('Upgrade: websocket')
  }

  /**
   * Initiates the WebSocket handshake for the CLIENT.
   * For SERVER type, waits for client handshake and responds accordingly.
   * @param callback - A callback to invoke after the handshake.
   */
  handshake(callback?: () => void): void {
    if (this.connection.type === Connection.CLIENT) {
      const handshakeRequest =
        `GET ${this.path} HTTP/1.1\r\n` +
        `Host: ${this.connection.socket.remoteAddress}:${this.connection.socket.remotePort}\r\n` +
        'Upgrade: websocket\r\n' +
        'Connection: Upgrade\r\n' +
        'Sec-WebSocket-Key: x3JJHMbDL1EzLkh9GBhXDw==\r\n' +
        'Sec-WebSocket-Version: 13\r\n\r\n'
      if (callback) {
        this.connection.transitionTo(new HandShake(this.connection, callback))
        const writable = new Writable()
        writable.push(Buffer.from(handshakeRequest))
        this.connection.write(writable)
      }
    } else if (this.connection.type === Connection.SERVER) {
      this.connection.transitionTo(new HandShake(this.connection))
      this.connection.parse()
      this.connection.reply()
    }
  }

  /**
   * DeObfuscates a WebSocket message.
   * @param message - The obfuscated WebSocket message.
   * @returns The de-obfuscated message payload.
   */
  deObfuscate(message: Buffer): Buffer {
    if (this.handshakeFlag === false) {
      return message
    } else {
      const payloadOffset = 2 // Skipping the first 2 bytes of WebSocket framing
      return message.slice(payloadOffset)
    }
  }

  /**
   * Obfuscates a message by framing it as a WebSocket message.
   * @param message - The non-obfuscated message.
   * @returns The obfuscated WebSocket message.
   */
  obfuscate(message: Buffer): Buffer {
    if (this.handshakeFlag === false) {
      return message
    } else {
      const frame = Buffer.alloc(message.length + 2) // Basic WebSocket frame
      frame[0] = 0x81 // Set FIN and TextFrame opcode
      frame[1] = message.length // Payload length

      message.copy(frame, 2) // Copy the message payload after the WebSocket header
      return frame
    }
  }
}

/**
 * Builds a WebSocket obfuscation method object.
 * @param path - Endpoint path.
 * @param compression - Compression method.
 * @param encryption - Encryption algorithm.
 */
export const websocket =
  (
    path = '/',
    compression: string = compressionMethods.none,
    encryption: string = encryptionMethods.none
  ) =>
  (connection: Connection) => {
    return new WebSocket(connection, path, compression, encryption)
  }
