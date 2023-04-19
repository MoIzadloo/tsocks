import { AuthMethod } from './authMethod'
import Connection from './connection'
import { ObfsBuilder } from '../obfs/obfs'

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
  public obfs: ObfsBuilder[]
  constructor(
    req: Req,
    auth: AuthMethod[] = [],
    obfs: ObfsBuilder[] = [],
    userId: (userId: string) => boolean = () => true
  ) {
    this.req = req
    this.auth = auth
    this.obfs = obfs
    this.userId = userId
  }
}
