import { AuthMethod } from './authMethod'
import Connection from './connection'

interface Req {
  connect: (connection: Connection) => void
  associate: (connection: Connection) => void
  bind: (connection: Connection) => void
}

/**
 * The Handlers class contains handler functions corresponding
 * to authentication and request (connect | associate | bind)
 */
export class Handlers {
  public userId: (userId: string) => boolean
  public auth: AuthMethod[]
  public req: Req
  constructor(req: Req) {
    this.userId = () => true
    this.auth = []
    this.req = req
  }
}
