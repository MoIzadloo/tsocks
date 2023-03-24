import Address from './address'
import Connection from './connection'
import * as net from 'net'

export interface Info {
  version: number
  address: Address
  userId?: string
}

export interface HandlerResolve {
  socket: net.Socket
  address: Address
  rsv?: number
}

export type Handler = (
  info: Info,
  socket: net.Socket,
  resolve?: (value: PromiseLike<HandlerResolve> | HandlerResolve) => void,
  reject?: ((reason?: any) => void) | undefined
) => void

/**
 * Inputs a callback function and return a function that accept connection and,
 * executes callback with function  its properties
 * @returns function
 */
export const handler =
  (callback: Handler) =>
  (connection: Connection): void => {
    if (connection.request) {
      callback(
        {
          version: connection.request.ver,
          address: connection.request.addr,
          userId: connection.userId,
        },
        connection.socket,
        connection.resolve,
        connection.reject
      )
    }
  }
