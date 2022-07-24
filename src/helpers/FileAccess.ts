import { memoize } from "lodash-es";
import { openDB } from 'idb';
import dayjs from "dayjs";
import { getStreamHash } from "./hash";

/**
 * Chrome magic feature.
 * 
 * @see https://web.dev/file-system-access/
 * @see https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
 */
const isFileSystemHandleSupported = typeof window.FileSystemHandle !== 'undefined'

/**
 * Open a file picker and ask user to pick a file.
 * 
 * The returned `hash` can be used in next session with `requestRecentFile`
 * 
 * @see {@link requestRecentFile}
 */
export async function requestNewFile(): Promise<{ file: File, hash: string }> {
  let handle: FileSystemFileHandle | undefined
  let file: File

  if (typeof window.showOpenFilePicker === 'function') {
    [handle] = await window.showOpenFilePicker()
    file = await handle.getFile()
  } else {
    // Firefox or old browsers. fallback to legacy way

    file = await new Promise<File>((resolve, reject) => {
      let fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.style.display = 'none';
      document.body.appendChild(fileInput);

      fileInput.addEventListener('focus', () => {
        const file = fileInput.files?.[0]
        if (file) resolve(file)
        else reject(new Error('No file selected'));

        document.body.removeChild(fileInput);
      });
    });
  }

  const hash = await file2hash(file)

  if (isFileSystemHandleSupported && handle) {
    const store = await getFileHandleCacheStore()
    await store.put(hash, handle)
  }

  return { file, hash }
}

/**
 * Try to re-open a recently requested file. If failed, return `null`.
 * 
 * @param hash - returned by `requestNewFile`
 */
export async function requestRecentFile(hash: string): Promise<null | { file: File, hash: string }> {
  if (!isFileSystemHandleSupported) return null;

  const store = await getFileHandleCacheStore()
  const handle = await store.get(hash)

  if (!handle) return null;

  try {
    if ((await handle.queryPermission({ mode: 'read' })) !== 'granted') {
      await handle.requestPermission({ mode: 'read' })
    }

    const file = await handle.getFile()
    const newHash = await file2hash(file)

    if (newHash !== hash) {
      // file hash is changed
      await store.put(newHash, handle)
    }

    return { file, hash: newHash }
  } catch (err) {
    // handle is not usable. maybe temporary permission denied.
    console.error('Cannot re-use old handle', err)
  }

  return null;
}

async function file2hash(file: File): Promise<string> {
  const hash = file.size.toString(16) + ':' + await getStreamHash((file.stream() as unknown as ReadableStream<Uint8Array>).getReader())
  return hash
}

const getFileHandleCacheStore = memoize(async function () {
  const storeName = 'fileHandleMemory'

  const db = await openDB<{
    [storeName]: {
      key: string,
      value: { hash: string, handle: FileSystemFileHandle, atime: number },
      indexes: { atime: number }
    }
  }>('fileHandleMemory', 1, {
    upgrade(db, oldVersion) {
      if (oldVersion < 1) {
        let store = db.createObjectStore(storeName, { keyPath: 'hash' });
        store.createIndex('atime', 'atime')
      }
    },
  })

  // cleanup staled caches

  const cleanup = async () => {
    let tx = db.transaction(storeName, 'readwrite')
    const threshTime = dayjs().subtract(30, 'd').valueOf();
    let staleCursor = await tx.store.index('atime').openCursor(IDBKeyRange.upperBound(threshTime))
    while (staleCursor) {
      await staleCursor.delete()
      staleCursor = await staleCursor.continue()
    }
    await tx.done
  }

  await cleanup()

  // done. return the store

  return {
    /**
     * try get a cached FileSystemFileHandle. if found, its `atime` (recent access time) will be updated to now.
     */
    async get(hash: string) {
      let item = await db.get(storeName, hash)
      if (item) await db.put(storeName, { ...item, atime: Date.now() })

      return item?.handle
    },
    /**
     * put a FileSystemFileHandle to cache.
     */
    async put(hash: string, handle: FileSystemFileHandle) {
      await db.put(storeName, { hash, handle, atime: Date.now() })
    },
    /**
     * remove a FileSystemFileHandle from cache.
     */
    async delete(hash: string) {
      await db.delete(storeName, hash)
    },
    /** cleanup staled caches */
    cleanup
  }
})
