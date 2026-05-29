import { enqueueOfflineAction, listOfflineQueue, queueStats, removeQueueItem, updateQueueItem } from "./offlineQueue.js";

function nowIso() {
  return new Date().toISOString();
}

function buildConflictCopy(item, reason) {
  return {
    ...item,
    id: `${item.id}-conflict-${Date.now()}`,
    status: "conflict",
    error: reason,
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
}

export async function queueMutation(module, action, payload, localId) {
  return enqueueOfflineAction({
    module,
    action,
    payload,
    localId,
    status: "pending"
  });
}

export async function runSyncCycle(syncHandlers) {
  const pending = await listOfflineQueue("pending");
  for (const item of pending) {
    const handler = syncHandlers[item.module];
    if (!handler) {
      await updateQueueItem(item.id, { status: "failed", error: "No sync handler for module." });
      continue;
    }

    try {
      await handler(item);
      await updateQueueItem(item.id, {
        status: "synced",
        error: null,
        tries: item.tries + 1
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const nextTry = item.tries + 1;
      const isConflict = /conflict|409|already exists/i.test(message);

      if (isConflict) {
        const conflictCopy = buildConflictCopy(item, message);
        await enqueueOfflineAction(conflictCopy);
      }

      await updateQueueItem(item.id, {
        status: isConflict ? "conflict" : "failed",
        error: message,
        tries: nextTry
      });
    }
  }
  return queueStats();
}

export async function clearSyncedItems() {
  const synced = await listOfflineQueue("synced");
  for (const row of synced) {
    await removeQueueItem(row.id);
  }
}
