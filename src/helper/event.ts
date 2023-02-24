export interface Handler<
  E extends Record<
    string,
    (...args: Parameters<E[keyof E]>) => ReturnType<E[keyof E]>
  >,
  K extends keyof E
> {
  event: K
  once: boolean
  handler: (...args: Parameters<E[K]>) => void
}

/**
 * The Event class is responsible to provide an API to subscribe new handlers,
 * and triggers them whenever is necessary
 */
class Event<
  E extends Record<string, (...args: any) => ReturnType<E[keyof E]>>
> {
  /**
   * An array that contains subscribed handler functions
   */
  private handlers: Map<number, Handler<E, keyof E>>

  /**
   * A number that behaves as a counter and used as an id for new handlers
   */
  private count: number

  constructor() {
    this.handlers = new Map()
    this.count = 0
  }

  /**
   * Triggers handler functions of a corresponding event
   * @param event - Event name
   * @param args - Event corresponding arguments
   * @public
   * @returns void
   */
  public trigger<K extends keyof E & string>(
    event: K,
    ...args: Parameters<E[K]>
  ): void {
    this.handlers.forEach((v, k) => {
      if (event === v.event) {
        v.handler(...args)
        if (v.once) {
          this.unsubscribe(k)
        }
      }
    })
  }

  /**
   * Subscribe new handler
   * @param event - Event name
   * @param handler - Handler function
   * @public
   * @returns number
   */
  public subscribe<K extends keyof E & string>(
    event: K,
    handler: (...args: Parameters<E[K]>) => ReturnType<E[K]>
  ): number {
    this.handlers.set(++this.count, {
      event,
      once: false,
      handler,
    })
    return this.count
  }

  /**
   * Subscribe new handler which triggers only once
   * @param event - Event name
   * @param handler - Handler function
   * @public
   * @returns number
   */
  public subscribeOnce<K extends keyof E & string>(
    event: K,
    handler: (...args: Parameters<E[K]>) => ReturnType<E[K]>
  ): number {
    this.handlers.set(++this.count, {
      event,
      once: true,
      handler,
    })
    return this.count
  }

  /**
   * Unsubscribe handler from handlers by id
   * @param id - Handler id
   * @public
   * @returns void
   */
  public unsubscribe(id: number): void {
    this.handlers.delete(id)
  }
}

export default Event
