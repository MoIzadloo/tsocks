import * as Buffer from 'buffer'

/**
 * Turns buffer into array of numbers
 * @param buffer - Input Buffer
 * @returns number[]
 */
export const bufToArray = (buffer: Buffer): number[] => {
  const array = []
  for (const data of buffer.values()) array.push(data)
  return array
}
