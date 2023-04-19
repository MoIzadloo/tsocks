import ObfsMethod from './obfs'
import Connection from '../helper/connection'

/**
 * The none is the simplest available obfuscation method
 */
class None extends ObfsMethod {
  name = 'None'

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
  handshake(callback: () => void): void {
    callback()
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
export const none =
  () =>
  (
    connection: Connection,
    type:
      | typeof ObfsMethod.CLIENT
      | typeof ObfsMethod.SERVER = ObfsMethod.CLIENT
  ) => {
    return new None(connection, type)
  }
