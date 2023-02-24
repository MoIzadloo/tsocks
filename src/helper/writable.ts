/**
 * The Writable class is an array in which you can push bytes and turn
 * them into a single Buffer when it's necessary
 */
class Writable extends Array {
  /**
   * Turn Writable to a single Buffer
   * @returns Buffer
   */
  public toBuffer(): Buffer {
    return Buffer.from(this)
  }
}

export default Writable
