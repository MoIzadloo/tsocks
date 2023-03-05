import Connection from '../../helper/connection'
import { Handlers } from '../../helper/handlers'
import Writable from '../../helper/writable'
import { none } from './methods/none'
import { SOCKSVERSIONS } from '../../helper/constants'
import { MethodSelectionState } from '../state/socks5'

/**
 * The Authenticator Class is responsible for resolving incoming
 * authentication requests specific for socks5
 */
class Authenticator {
  /**
   * Server acceptable methods
   */
  private readonly availableMethods: Handlers['auth']

  /**
   * Corresponding connection
   */
  private readonly connection: Connection

  constructor(connection: Connection) {
    this.connection = connection
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
    writable.push(SOCKSVERSIONS.socks5, this.availableMethods.length)
    for (const method of this.availableMethods) {
      writable.push(method.method)
    }
    this.connection.transitionTo(new MethodSelectionState(this.connection))
    this.connection.write(writable)
  }
}

export default Authenticator
