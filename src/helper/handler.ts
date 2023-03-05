import Address from './address'
import Connection from './connection'
import * as net from 'net'

export interface Info {
  version: number
  address: Address
}

export type Handler = (info: Info, socket: net.Socket) => void

/**
 * Inputs a callback function and return a function that accept connection and,
 * executes callback with function  its properties
 * @returns function
 */
export const handler =
  (callback: (info: Info, socket: net.Socket) => void) =>
  (connection: Connection): void => {
    if (connection.version && connection.address) {
      callback(
        {
          version: connection.version,
          address: connection.address,
        },
        connection.socket
      )
    }
  }
