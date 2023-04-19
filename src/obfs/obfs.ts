import Connection from '../helper/connection'

/**
 * The ObfsMethod class is an abstract class that all other,
 * extended classes should implement its methods and properties
 * every obfuscation method should extend this class
 */
abstract class ObfsMethod {
  public static readonly CLIENT = 'CLIENT'

  public static readonly SERVER = 'SERVER'

  /**
   * The type of obfuscation
   */
  public type: typeof ObfsMethod.CLIENT | typeof ObfsMethod.SERVER

  /**
   * Connection object
   */
  protected connection: Connection

  /**
   * The Obfuscation method name
   */
  public abstract name: string

  constructor(
    connection: Connection,
    type: typeof ObfsMethod.CLIENT | typeof ObfsMethod.SERVER
  ) {
    this.connection = connection
    this.type = type
  }

  /**
   * Checks if the message format is Appropriate with
   * this obfuscation method
   * @param message - The incoming message
   */
  public abstract check(message: Buffer): boolean

  /**
   * Begins the handshake process for the encryption
   * @param callback - Emitted after the handshake process
   */
  public abstract handshake(callback: () => void): void

  /**
   * DeObfuscates the obfuscated message
   * @param message - The obfuscated message
   */
  public abstract deObfuscate(message: Buffer): Buffer

  /**
   * Obfuscates the non-obfuscated message
   * @param message - The non-obfuscated message
   */
  public abstract obfuscate(message: Buffer): Buffer
}

export type ObfsBuilder = (
  connection: Connection,
  type?: typeof ObfsMethod.CLIENT | typeof ObfsMethod.SERVER
) => ObfsMethod

export default ObfsMethod
