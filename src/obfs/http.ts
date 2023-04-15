import ObfsMethod from './obfs'
import Connection from '../helper/connection'
import { encryptionMethods } from '../helper/constants'
import { obfsHttpMethods } from '../helper/constants'

export class Http extends ObfsMethod {
  public path
  public name = 'HTTP'
  public encryption: string
  public method: string
  constructor(
    path = '',
    encryption = encryptionMethods.none,
    method = obfsHttpMethods.post
  ) {
    super()
    this.path = path
    this.encryption = encryption
    this.method = method
  }

  handshake() {
    console.log('ran')
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
      m.forEach((match, groupIndex) => {
        console.log(match)
        console.log(`Found match, group ${groupIndex}: ${match}`)
      })
    }
    return true
  }

  deObfuscate(message: Buffer): Buffer {
    return message
  }

  obfuscate(message: Buffer): Buffer {
    return message
  }
}
