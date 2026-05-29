const DB_NAME = "ics-offline-sync-v1";
const STORE_NAME = "queue_items";
const DB_VERSION = 1;

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("status", "status", { unique: false });
        store.createIndex("module", "module", { unique: false });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
}

function txDone(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error || new Error("Transaction aborted"));
  });
}

function randomId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `q_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export async function enqueueOfflineAction(action) {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const record = {
    id: action.id || randomId(),
    module: action.module || "general",
    action: action.action || "upsert",
    status: action.status || "pending",
    localId: action.localId || null,
    remoteId: action.remoteId || null,
    payload: action.payload || {},
    tries: Number(action.tries || 0),
    error: action.error || null,
    createdAt: action.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  store.put(record);
  await txDone(tx);
  db.close();
  return record;
}

export async function listOfflineQueue(status) {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const rows = await new Promise((resolve, reject) => {
    const request = status
      ? store.index("status").getAll(status)
      : store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
  await txDone(tx);
  db.close();
  return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function updateQueueItem(id, patch) {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const current = await new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  if (!current) {
    await txDone(tx);
    db.close();
    return null;
  }
  const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
  store.put(next);
  await txDone(tx);
  db.close();
  return next;
}

export async function removeQueueItem(id) {
  const db = await openDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  tx.objectStore(STORE_NAME).delete(id);
  await txDone(tx);
  db.close();
}

export async function queueStats() {
  const rows = await listOfflineQueue();
  return rows.reduce(
    (acc, row) => {
      acc.total += 1;
      acc[row.status] = (acc[row.status] || 0) + 1;
      return acc;
    },
    { total: 0, pending: 0, synced: 0, failed: 0, conflict: 0 }
  );
}
