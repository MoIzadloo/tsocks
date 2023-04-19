import Address from './address'
import Connection, { EventTypes } from './connection'
import * as net from 'net'
import Event from './event'
import Obfs from '../obfs/obfs'

export interface Info {
  version: number
  address: Address
  userId?: string
}

export interface HandlerResolve {
  socket: net.Socket
  address: Address
  obfs: Obfs
  rsv?: number
  args?: any
}

export type Handler = (
  info: Info,
  socket: net.Socket,
  obfs: Obfs,
  event?: Event<EventTypes>,
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
    if (connection.request && connection.obfs) {
      callback(
        {
          version: connection.request.ver,
          address: connection.request.addr,
          userId: connection.request.userId,
        },
        connection.socket,
        connection.obfs,
        connection.event,
        connection.resolve,
        connection.reject
      )
    }
  }
