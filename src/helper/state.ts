import Connection from './connection'

/**
 * The State class is an abstract class that all other,
 * extended classes should implement its methods and properties
 * we implemented a design pattern called state design pattern here
 */
export abstract class State {
  /**
   * Context
   */
  protected context: Connection

  constructor(context: Connection) {
    this.context = context
  }

  /**
   * Change state from one to other
   * @param state - The state to change to
   * @returns void
   */
  public transitionTo(state: State): void {
    this.context.transitionTo(state)
  }

  /**
   * Parse request
   * @returns void
   */
  public abstract parse(): void

  /**
   * Reply to the user with a proper response
   * @returns void
   */
  public abstract reply(): void
}
