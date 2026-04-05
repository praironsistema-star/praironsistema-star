import Dexie, { Table } from 'dexie';

export interface OfflineRecord {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  syncStatus: 'pending' | 'synced' | 'error';
  companyId: string;
  createdAt: number;
  retries: number;
}

export class PraiронOfflineDB extends Dexie {
  records!: Table<OfflineRecord>;
  constructor() {
    super('prairon_offline');
    this.version(1).stores({
      records: 'id, type, syncStatus, companyId, createdAt'
    });
  }
}

export const offlineDB = new PraiронOfflineDB();
