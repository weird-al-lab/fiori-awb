import { DOKUMENTE_DB_NAME, DOKUMENTE_STORE } from './constants'
import type { AntragDokument } from './types'

function openDokumenteDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DOKUMENTE_DB_NAME, 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(DOKUMENTE_STORE)) {
        db.createObjectStore(DOKUMENTE_STORE)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB open failed'))
  })
}

export async function saveDokumentBlob(dokumentId: string, blob: Blob): Promise<void> {
  const db = await openDokumenteDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DOKUMENTE_STORE, 'readwrite')
    tx.objectStore(DOKUMENTE_STORE).put(blob, dokumentId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB put failed'))
  })
  db.close()
}

export async function getDokumentBlob(dokumentId: string): Promise<Blob | undefined> {
  const db = await openDokumenteDb()
  const blob = await new Promise<Blob | undefined>((resolve, reject) => {
    const tx = db.transaction(DOKUMENTE_STORE, 'readonly')
    const request = tx.objectStore(DOKUMENTE_STORE).get(dokumentId)
    request.onsuccess = () => resolve(request.result as Blob | undefined)
    request.onerror = () => reject(request.error ?? new Error('IndexedDB get failed'))
  })
  db.close()
  return blob
}

export async function deleteDokumentBlob(dokumentId: string): Promise<void> {
  const db = await openDokumenteDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(DOKUMENTE_STORE, 'readwrite')
    tx.objectStore(DOKUMENTE_STORE).delete(dokumentId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error ?? new Error('IndexedDB delete failed'))
  })
  db.close()
}

export function createDokumentMeta(file: File): AntragDokument {
  return {
    id: `doc-${crypto.randomUUID()}`,
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
    uploadedAt: new Date().toISOString(),
  }
}
