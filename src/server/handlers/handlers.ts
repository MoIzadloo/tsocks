import { Method } from '../../auth/methods/method'
import Connection from '../connection'
import { connect, associate, bind } from './default'

/**
 * The Handlers class contains handler functions corresponding
 * to authentication and request (connect | associate | bind)
 */
export class Handlers {
  public userId: (userId: string) => boolean
  public auth: Method[]
  public req: {
    connect: (connection: Connection) => void
    associate: (connection: Connection) => void
    bind: (connection: Connection) => void
  }
  constructor() {
    this.userId = () => true
    this.auth = []
    this.req = {
      connect,
      bind,
      associate,
    }
  }
}
