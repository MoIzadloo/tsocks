import ObfsMethod from './obfs'
import Connection from '../helper/connection'
import {
  encryptionMethods,
  obfsHttpMethods,
  compressionMethods,
} from '../helper/constants'
import Readable from '../helper/readable'
import { IdentifierState } from '../server/state/socks5'

/**
 * The Http class is an obfuscation method based on the
 * HTTP protocol
 */
class Http extends ObfsMethod {
  public path
  public name = 'HTTP'
  public encryption: string
  public compression: string
  public method: string
  public handshakeFlag: boolean
  constructor(
    connection: Connection,
    path: string,
    compression: string,
    encryption: string,
    method: string
  ) {
    super(connection)
    this.path = path
    this.compression = compression
    this.encryption = encryption
    this.method = method
    this.handshakeFlag = false
  }

  /**
   * Checks if the message format is Appropriate with
   * this obfuscation method
   * @param message - The incoming message
   */
  check(message: Buffer) {
    const regex = new RegExp(
      `^(?<method>GET|POST|PUT|DELETE|HEAD|OPTIONS).\\/(?<path>[^HTTP]*) HTTP\\/(?<version>.*)`
    )
    const m = regex.exec(message.toString())
    if (m) {
      if (m[1] === this.method || m[2] === this.path || m[3] === '1.1') {
        return true
      }
    }
    return false
  }

  /**
   * Begins the handshake process for the encryption
   * @param callback - Emitted after the handshake process
   */
  handshake(callback?: () => void): void {
    if (this.connection.type === Connection.CLIENT) {
      this.handshakeFlag = true
      if (callback) {
        callback()
      }
    } else {
      this.handshakeFlag = true
      this.connection.readable = new Readable(
        this.deObfuscate(this.connection.read())
      )
      this.connection.transitionTo(new IdentifierState(this.connection))
      this.connection.parse()
      this.connection.reply()
    }
  }

  /**
   * DeObfuscates the obfuscated message
   * @param message - The obfuscated message
   */
  deObfuscate(message: Buffer): Buffer {
    const http = message.toString()
    const bodyIndex = http.indexOf('\r\n\r\n')
    const parts = http.slice(0, bodyIndex).split('\r\n')
    const start = parts[0]
    const headers = parts.splice(1, parts.length)
    const body = Buffer.from(http.slice(bodyIndex + 4), 'binary')
    const parsedHeaders: any = {}
    const regex = new RegExp(`([\\w-]+): (.*)`)
    headers.forEach((value) => {
      const m = regex.exec(value)
      if (m) {
        parsedHeaders[m[1]] = m[2]
      }
    })
    return body
  }

  /**
   * Obfuscates the non-obfuscated message
   * @param message - The non-obfuscated message
   */
  obfuscate(message: Buffer): Buffer {
    let http = ''
    if (this.connection.type === Connection.SERVER) {
      http += `HTTP/1.1 200 OK\r\n`
      http += `Connection: keep-alive\r\n`
      http += `Content-Type: text/html; charset=utf-8\r\n`
      http += `Content-Length: ${message.length}\r\n\r\n`
      http += message.toString('binary')
    } else {
      http += `POST /${this.path} HTTP/1.1\r\n`
      http += `Host: ${this.connection.socket.remoteAddress}:${this.connection.socket.remotePort}\r\n`
      http += `Connection: keep-alive\r\n`
      http += `Accept: text/html; charset=utf-8\r\n`
      http += `Content-Length: ${message.length}\r\n\r\n`
      http += message.toString('binary')
    }
    return Buffer.from(http)
  }
}

/**
 * builds a Http obfuscation method object
 * @param path - Endpoint path
 * @param compression - Compression method
 * @param encryption - Encryption algorithm
 * @param method - HTTP method
 */
export const http =
  (
    path = '',
    method = obfsHttpMethods.post,
    compression = compressionMethods.none,
    encryption = encryptionMethods.none
  ) =>
  (connection: Connection) => {
    return new Http(connection, path, compression, encryption, method)
  }
