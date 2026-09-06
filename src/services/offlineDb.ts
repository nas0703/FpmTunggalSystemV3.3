export const OFFLINE_DB_NAME = 'ipds-offline-v1';
export const OFFLINE_DB_VERSION = 1;
export const OUTBOX_STORE = 'outbox';

export type OutboxStatus = 'pending_sync' | 'syncing' | 'failed';

export interface OutboxRecord {
  id: string;
  endpoint: string;
  method: string;
  headers?: Record<string, string>;
  body?: string;
  createdAt: number;
  updatedAt: number;
  attempts: number;
  status: OutboxStatus;
  lastError?: string;
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.reject(new Error('IndexedDB is not available in this environment'));
  }
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(OFFLINE_DB_NAME, OFFLINE_DB_VERSION);
    request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(OUTBOX_STORE)) {
        const store = db.createObjectStore(OUTBOX_STORE, { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });

  return dbPromise;
}

export async function putOutbox(record: OutboxRecord): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite');
    tx.objectStore(OUTBOX_STORE).put(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Failed to write outbox record'));
  });
}

export async function deleteOutbox(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readwrite');
    tx.objectStore(OUTBOX_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error('Failed to delete outbox record'));
  });
}

export async function getOutboxRecords(): Promise<OutboxRecord[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(OUTBOX_STORE, 'readonly');
    const request = tx.objectStore(OUTBOX_STORE).getAll();
    request.onerror = () => reject(request.error ?? new Error('Failed to read outbox'));
    request.onsuccess = () => resolve((request.result as OutboxRecord[]).sort((a, b) => a.createdAt - b.createdAt));
  });
}

export async function countPendingOutbox(): Promise<number> {
  const records = await getOutboxRecords();
  return records.filter((r) => r.status === 'pending_sync' || r.status === 'syncing').length;
}
