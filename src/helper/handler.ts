import Address from './address'
import Connection from './connection'
import * as net from 'net'

export interface Info {
  version: number
  address: Address
  userId?: string
}

export type Handler = (
  info: Info,
  socket: net.Socket,
  resolve?: (value: net.Socket | PromiseLike<net.Socket>) => void,
  reject?: (reason?: any) => void
) => void

/**
 * Inputs a callback function and return a function that accept connection and,
 * executes callback with function  its properties
 * @returns function
 */
export const handler =
  (callback: Handler) =>
  (connection: Connection): void => {
    if (connection.version && connection.address) {
      callback(
        {
          version: connection.version,
          address: connection.address,
          userId: connection.userId,
        },
        connection.socket,
        connection.resolve,
        connection.reject
      )
    }
  }
