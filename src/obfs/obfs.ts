import Connection from '../helper/connection'

abstract class ObfsMethod {
  public static readonly CLIENT = 'CLIENT'
  public static readonly SERVER = 'SERVER'
  public type: typeof ObfsMethod.CLIENT | typeof ObfsMethod.SERVER
  protected connection: Connection
  constructor(
    connection: Connection,
    type: typeof ObfsMethod.CLIENT | typeof ObfsMethod.SERVER
  ) {
    this.connection = connection
    this.type = type
  }
  public abstract name: string
  public abstract check(message: Buffer): boolean
  public abstract handshake(callback: () => void): void
  public abstract deObfuscate(message: Buffer): Buffer
  public abstract obfuscate(message: Buffer): Buffer
}

export type ObfsBuilder = (
  connection: Connection,
  type?: typeof ObfsMethod.CLIENT | typeof ObfsMethod.SERVER
) => ObfsMethod

export default ObfsMethod
