import {
  deleteOutbox,
  getOutboxRecords,
  putOutbox,
  type OutboxRecord,
} from './offlineDb';

export const OFFLINE_SYNC_EVENT = 'ipds:offline-sync';

function emitSyncEvent(detail: Record<string, unknown>): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(OFFLINE_SYNC_EVENT, { detail }));
  }
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export interface QueueMutationOptions {
  endpoint: string;
  method?: string;
  headers?: Record<string, string>;
  body?: unknown;
  idempotencyKey?: string;
}

export async function queueMutation(options: QueueMutationOptions): Promise<{ id: string; queued: true }> {
  const id = options.idempotencyKey ?? makeId();
  const headers = { ...(options.headers ?? {}) };
  headers['X-Idempotency-Key'] = id;

  const record: OutboxRecord = {
    id,
    endpoint: options.endpoint,
    method: options.method ?? 'POST',
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    createdAt: Date.now(),
    updatedAt: Date.now(),
    attempts: 0,
    status: 'pending_sync',
  };

  await putOutbox(record);
  emitSyncEvent({ type: 'queued', id });
  return { id, queued: true };
}

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

async function syncOne(record: OutboxRecord): Promise<'synced' | 'retry' | 'failed'> {
  const next: OutboxRecord = { ...record, status: 'syncing', attempts: record.attempts + 1, updatedAt: Date.now() };
  await putOutbox(next);
  emitSyncEvent({ type: 'syncing', id: record.id, attempts: next.attempts });

  try {
    const response = await fetch(record.endpoint, {
      method: record.method,
      headers: record.headers,
      body: record.body,
    });

    if (response.ok) {
      await deleteOutbox(record.id);
      emitSyncEvent({ type: 'synced', id: record.id });
      return 'synced';
    }

    if (isRetryableStatus(response.status)) {
      await putOutbox({ ...next, status: 'pending_sync', lastError: `HTTP ${response.status}`, updatedAt: Date.now() });
      emitSyncEvent({ type: 'retry', id: record.id, status: response.status });
      return 'retry';
    }

    await putOutbox({ ...next, status: 'failed', lastError: `HTTP ${response.status}`, updatedAt: Date.now() });
    emitSyncEvent({ type: 'failed', id: record.id, status: response.status });
    return 'failed';
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Network error';
    await putOutbox({ ...next, status: 'pending_sync', lastError: message, updatedAt: Date.now() });
    emitSyncEvent({ type: 'retry', id: record.id, error: message });
    return 'retry';
  }
}

let syncInProgress = false;

export async function syncOutbox(): Promise<void> {
  if (syncInProgress || typeof navigator === 'undefined' || !navigator.onLine) return;
  syncInProgress = true;
  emitSyncEvent({ type: 'sync-start' });

  try {
    const records = (await getOutboxRecords()).filter((r) => r.status === 'pending_sync' || r.status === 'syncing');
    for (const record of records) {
      if (!navigator.onLine) break;
      const result = await syncOne(record);
      if (result === 'retry') break;
    }
  } finally {
    syncInProgress = false;
    emitSyncEvent({ type: 'sync-end' });
  }
}

export function registerOnlineSync(): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const handler = () => void syncOutbox();
  window.addEventListener('online', handler);
  return () => window.removeEventListener('online', handler);
}
