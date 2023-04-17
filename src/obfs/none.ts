import ObfsMethod from './obfs'
import Connection from '../helper/connection'

class None extends ObfsMethod {
  name = 'None'

  check(message: Buffer): boolean {
    return message[0] === 5 || message[0] === 4 || message[0] === 1
  }

  deObfuscate(message: Buffer): Buffer {
    return message
  }

  obfuscate(message: Buffer): Buffer {
    return message
  }

  handshake(callback: () => void): void {
    callback()
  }
}

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
