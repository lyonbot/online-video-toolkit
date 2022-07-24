/**
 * compute cyrb53 hash from a readable stream
 * 
 * only first 30MB content will be computed
 */
export async function getStreamHash(reader: ReadableStreamReader<Uint8Array>, seed = 0): Promise<string> {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
  let byteCount = 0

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const u8arr = value!

    // only compute 30MB
    for (let i = 0; i < u8arr.length && byteCount < 30e6; i++, byteCount++) {
      let ch = u8arr[i]

      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

  let hash = 4294967296 * (2097151 & h2) + (h1 >>> 0)

  // close the stream, in background
  reader.cancel().catch(() => 0)

  return hash.toString(16)
}
