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
    const buffers = []
    for (const byte of this) {
      if (byte instanceof Buffer) {
        buffers.push(byte)
      } else {
        buffers.push(Buffer.from([byte]))
      }
    }
    return Buffer.concat(buffers)
  }
}

export default Writable
