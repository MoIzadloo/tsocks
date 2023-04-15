import Connection from '../helper/connection'

abstract class ObfsMethod {
  public abstract name: string
  public abstract check(message: Buffer): boolean
  public abstract handshake(connection: Connection): void
  public abstract deObfuscate(message: Buffer): Buffer
  public abstract obfuscate(message: Buffer): Buffer
}

export default ObfsMethod
