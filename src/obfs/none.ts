import Obfs from './obfs'

export class None extends Obfs {
  name = 'None'

  check(message: Buffer): boolean {
    return message[0] === 5 || message[0] === 4 || message[0] === 1
  }

  DeObfuscate(message: Buffer): Buffer {
    return message
  }

  obfuscate(message: Buffer): Buffer {
    return message
  }
}
