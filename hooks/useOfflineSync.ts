import { useEffect, useState, useCallback } from 'react';
import { offlineDB, OfflineRecord } from '@/lib/offlineDB';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [pendingCount, setPendingCount] = useState(0);

  const refreshPending = useCallback(async () => {
    const count = await offlineDB.records
      .where('syncStatus').equals('pending').count();
    setPendingCount(count);
  }, []);

  const saveOffline = useCallback(async (
    type: string,
    payload: Record<string, unknown>,
    companyId: string
  ) => {
    const record: OfflineRecord = {
      id: crypto.randomUUID(),
      type,
      payload,
      syncStatus: 'pending',
      companyId,
      createdAt: Date.now(),
      retries: 0,
    };
    await offlineDB.records.add(record);
    await refreshPending();
    return record.id;
  }, [refreshPending]);

  const syncPending = useCallback(async () => {
    const pending = await offlineDB.records
      .where('syncStatus').equals('pending').toArray();
    for (const record of pending) {
      try {
        const res = await fetch(`/api/offline/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(record),
        });
        if (res.ok) {
          await offlineDB.records.update(record.id, { syncStatus: 'synced' });
        } else {
          await offlineDB.records.update(record.id, {
            retries: (record.retries || 0) + 1,
            syncStatus: record.retries >= 3 ? 'error' : 'pending'
          });
        }
      } catch {
        await offlineDB.records.update(record.id, {
          retries: (record.retries || 0) + 1
        });
      }
    }
    await refreshPending();
  }, [refreshPending]);

  useEffect(() => {
    refreshPending();
    const onOnline = () => { setIsOnline(true); syncPending(); };
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [refreshPending, syncPending]);

  return { isOnline, pendingCount, saveOffline, syncPending };
}
