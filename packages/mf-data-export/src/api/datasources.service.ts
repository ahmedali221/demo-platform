import { api } from '../lib/axios';

// ── Types ───────────────────────────────────────────────────────────────────

export interface Datasource {
  id: string;
  nameAr: string;
  nameEn: string;
  reportType: number;
}

// ── API calls ───────────────────────────────────────────────────────────────

export async function getDatasources(): Promise<Datasource[]> {
  const { data } = await api.get<Datasource[]>('/ingestion/data-sources');
  return Array.isArray(data) ? data : [];
}
