import ObfsMethod from './obfs'
import Connection from '../helper/connection'
import { encryptionMethods, obfsHttpMethods } from '../helper/constants'

class Http extends ObfsMethod {
  public path
  public name = 'HTTP'
  public encryption: string
  public method: string
  constructor(
    connection: Connection,
    type: typeof ObfsMethod.CLIENT | typeof ObfsMethod.SERVER,
    path: string,
    encryption: string,
    method: string
  ) {
    super(connection, type)
    this.path = path
    this.encryption = encryption
    this.method = method
  }

  handshake(callback: () => void): void {
    callback()
  }

  check(message: Buffer) {
    const regex = new RegExp(
      `^(?<method>GET|POST|PUT|DELETE|HEAD|OPTIONS).\\/(?<path>[^HTTP]*)HTTP\\/(?<version>.*)`
    )
    let m
    while ((m = regex.exec(message.toString())) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++
      }

      // The result can be accessed through the `m`-variable.
      if (m[1] !== this.method || m[2] !== this.path || m[3] !== '1.1') {
        return false
      }
    }
    return true
  }

  deObfuscate(message: Buffer): Buffer {
    const http = message.toString()
    if (this.type === ObfsMethod.SERVER) {
      const parts = http.split('\r\n')
      console.log(parts)
    }
    return message
  }

  obfuscate(message: Buffer): Buffer {
    let http = ''
    if (this.type === ObfsMethod.CLIENT) {
      http += `POST ${this.path} HTTP/1.1\r\n`
      http += `Host: ${this.connection.socket.remoteAddress}:${this.connection.socket.remotePort}\r\n`
      http += `Connection: keep-alive\r\n`
      http += `content-length: ${message.length}\r\n`
      http += message
      http += `\r\n\r\n`
    }
    return Buffer.from(http)
  }
}

export const http =
  (
    path = '',
    encryption = encryptionMethods.none,
    method = obfsHttpMethods.post
  ) =>
  (
    connection: Connection,
    type:
      | typeof ObfsMethod.CLIENT
      | typeof ObfsMethod.SERVER = ObfsMethod.CLIENT
  ) => {
    return new Http(connection, type, path, encryption, method)
  }
