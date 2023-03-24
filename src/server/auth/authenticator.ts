import Connection from '../../helper/connection'
import { Handlers } from '../../helper/handlers'
import Writable from '../../helper/writable'
import { none } from './methods'
import {SOCKSVERSIONS} from "../../helper/constants";

/**
 * The Authenticator Class is responsible for resolving incoming
 * authentication requests specific for socks5
 */
class Authenticator {
  /**
   * User suggested methods
   */
  private readonly methods: number[]

  /**
   * Server acceptable methods
   */
  private readonly availableMethods: Handlers['auth']

  /**
   * Corresponding connection
   */
  private readonly connection: Connection

  constructor(connection: Connection, methods: number[]) {
    this.connection = connection
    this.methods = methods
    if (connection.handlers.auth.length <= 0) {
      connection.handlers.auth.push(none())
    }
    this.availableMethods = connection.handlers.auth
  }

  /**
   * Negotiates for authentication method with the user and authenticates users
   * @returns void
   */
  public authenticate(): void {
    const writable = new Writable()
    let acceptable = false
    let selectedMethod = undefined
    for (const method of this.methods) {
      for (const availableMethod of this.availableMethods) {
        if (method === availableMethod.method) {
          selectedMethod = availableMethod
          acceptable = true
          break
        }
      }
      if (selectedMethod) {
        break
      }
    }
    if (acceptable && selectedMethod) {
      writable.push(SOCKSVERSIONS.socks5, selectedMethod.method)
      this.connection.write(writable)
      selectedMethod.authenticate(this.connection)
    } else {
      writable.push(SOCKSVERSIONS.socks5, 0xff)
      this.connection.write(writable)
      this.connection.close()
    }
  }
}

export default Authenticator
