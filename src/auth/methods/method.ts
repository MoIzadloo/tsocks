import Connection from '../../server/connection'

export interface Method {
  method: number
  authenticate: (connection: Connection) => void
}
