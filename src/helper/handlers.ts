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
  constructor(
    req: Req,
    auth: AuthMethod[] = [],
    userId: (userId: string) => boolean = () => true
  ) {
    this.req = req
    this.auth = auth
    this.userId = userId
  }
}
