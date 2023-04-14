import Obfs from './obfs'

export class Http extends Obfs {
  public path
  name = 'HTTP'
  constructor(path = '') {
    super()
    this.path = path
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

  DeObfuscate(message: Buffer): Buffer {
    return message
  }

  obfuscate(message: Buffer): Buffer {
    return message
  }
}
