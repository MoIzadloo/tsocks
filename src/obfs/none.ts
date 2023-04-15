import ObfsMethod from './obfs'
import Authenticator from '../client/auth/authenticator'
import Connection from '../helper/connection'

export class None extends ObfsMethod {
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

  handshake(connection: Connection): void {
    if (connection?.request?.ver === 5) {
      const authenticator = new Authenticator(connection)
      authenticator.authenticate()
    }
  }
}
