import Connection from './connection'

export interface AuthMethod {
  method: number
  authenticate: (connection: Connection) => void
}
