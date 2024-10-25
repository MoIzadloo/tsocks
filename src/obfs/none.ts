import ObfsMethod from './obfs'
import Connection from '../helper/connection'
import Readable from '../helper/readable'
import { IdentifierState } from '../server/state/socks5'

/**
 * The none is the simplest available obfuscation method
 */
class None extends ObfsMethod {
  public name = 'None'
  public handshakeFlag: boolean
  constructor(connection: Connection) {
    super(connection)
    this.handshakeFlag = false
  }

  /**
   * Checks if the message format is Appropriate with
   * this obfuscation method
   * @param message - The incoming message
   */
  check(message: Buffer): boolean {
    return message[0] === 5 || message[0] === 4 || message[0] === 1
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
    return message
  }

  /**
   * Obfuscates the non-obfuscated message
   * @param message - The non-obfuscated message
   */
  obfuscate(message: Buffer): Buffer {
    return message
  }
}

/**
 * builds a None obfuscation method object
 */
export const none = () => (connection: Connection) => {
  return new None(connection)
}
