/**
 * The Readable class turns a Buffer into a readable object,
 * so it could be read piece by pieces
 */
export class Readable {
  /**
   * Input Buffer
   */
  private data: Buffer

  constructor(data: Buffer) {
    this.data = data
  }

  /**
   * Read n bytes of data
   * @param bytes - Number of bytes to be read from data
   * @returns Buffer
   */
  public read(bytes: number): Buffer {
    const slice = this.data.subarray(0, bytes)
    this.data = this.data.subarray(bytes, this.data.length)
    return slice
  }

  /**
   * Read from data until a specific bytes
   * @param value - Buffer in which the reading process continues until it appears
   * @returns Buffer
   */
  public readUntil(value: Buffer): Buffer {
    const buffIndex = this.data.indexOf(value)
    const slice = this.data.subarray(0, buffIndex)
    this.data = this.data.subarray(buffIndex, this.data.length)
    return slice
  }
}
