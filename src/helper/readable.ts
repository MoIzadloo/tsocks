/**
 * The Readable class turns a Buffer into a readable object,
 * so it could be read piece by pieces
 */

class Readable {
  /**
   * Input Buffer
   */
  private data: Buffer

  constructor(data: Buffer) {
    this.data = data
  }

  /**
   * Read n bytes of data without modifying the data property,
   * reads all the data if no argument is passed
   * @param bytes - Number of bytes to be read from data
   * @returns Buffer
   */
  public cat(bytes?: number) {
    let slice
    if (bytes) {
      slice = this.data.subarray(0, bytes)
    } else {
      slice = this.data.subarray(0, this.data.length)
    }
    return slice
  }

  /**
   * Read n bytes of data,
   * reads all the data if no argument is passed
   * @param bytes - Number of bytes to be read from data
   * @returns Buffer
   */
  public read(bytes?: number): Buffer {
    let slice
    if (bytes) {
      slice = this.data.subarray(0, bytes)
    } else {
      slice = this.data.subarray(0, this.data.length)
    }
    this.data = this.data.subarray(bytes, this.data.length)
    return slice
  }

  /**
   * Read from data until a specific bytes
   * @param value - Buffer in which the reading process continues until it appears
   * @returns Buffer
   */
  public readUntil(value: Buffer | number): Buffer {
    let slice
    if (value instanceof Buffer) {
      const buffIndex = this.data.indexOf(value)
      slice = this.data.subarray(0, buffIndex)
      this.data = this.data.subarray(buffIndex, this.data.length)
    } else {
      if (value <= -1) {
        value = this.data.length + value
      }
      slice = this.data.subarray(0, value)
      this.data = this.data.subarray(value, this.data.length)
    }
    return slice
  }
}

export default Readable
