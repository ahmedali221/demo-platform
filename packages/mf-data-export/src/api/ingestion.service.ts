import { api } from '../lib/axios';
import type { LogEntry } from '../components/ImportLogsSidebar';
import type { ImportRecord } from '../components/ImportLogsTable';
import type { Datasource } from './datasources.service';

// ── API response types ──────────────────────────────────────────────────────

// Status integers from the backend: 2=Completed, 3=Failed
export interface IngestionSession {
  id: string;
  dataSourceId: string;
  dataSourceNameEn?: string;
  dataSourceNameAr?: string;
  fileName: string;
  status: number;
  rowsTotal: number;
  errorSummary: string | null;
  createdAt: string;
  completedAt: string | null;
}

export interface IngestionHistoryResponse {
  items: IngestionSession[];
  total: number;
}

export interface IngestionSummary {
  totalRows: number;
  uniqueCouriers: number;
  totalSessions: number;
  failedBatches: number;
  lastImportAt: string | null;
}

export interface IngestionHistoryParams {
  page?: number;
  pageSize?: number;
  status?: number;
  dataSourceId?: string;
  from?: string;
  to?: string;
  tenantId?: string;
}

export interface UploadResult {
  importBatchId: string;
  isDuplicate: boolean;
  rowsInserted: number;
  message?: string;
}

// ── API calls ───────────────────────────────────────────────────────────────

export async function getSummary(tenantId?: string): Promise<IngestionSummary> {
  const params: Record<string, string> = {};
  if (tenantId) params.tenantId = tenantId;
  const { data } = await api.get<IngestionSummary>('/ingestion/summary', { params });
  return data;
}

/** Paginated history — used by ImportLogsPage */
export async function getImportHistory(params: IngestionHistoryParams = {}): Promise<IngestionHistoryResponse> {
  const { data } = await api.get<IngestionHistoryResponse>('/ingestion/imports', { params });
  return data;
}

/** Legacy — returns flat array; kept for DataImportPage / useIngestionHistory hook */
export async function getIngestionHistory(): Promise<IngestionSession[]> {
  const { data } = await api.get<IngestionHistoryResponse>('/ingestion/imports');
  return data.items ?? [];
}

export async function getImportDetail(id: string): Promise<IngestionSession> {
  const { data } = await api.get<IngestionSession>(`/ingestion/imports/${id}`);
  return data;
}

export async function exportImportsCsv(filters: Omit<IngestionHistoryParams, 'page' | 'pageSize'> = {}): Promise<void> {
  const res = await api.get('/ingestion/imports/export', {
    params: filters,
    responseType: 'blob',
  });
  const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `import-history-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function uploadIngestionFile(
  dataSourceId: string,
  file: File,
  onProgress?: (pct: number) => void,
  signal?: AbortSignal,
): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);
  form.append('dataSourceId', dataSourceId);

  try {
    const { data } = await api.post<UploadResult>('/ingestion/upload', form, {
      signal,
      onUploadProgress(e) {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    });
    return data;
  } catch (err: unknown) {
    const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
    if (msg) throw new Error(msg);
    throw err;
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function mapStatusInt(status: number): 'success' | 'warning' | 'failed' | 'processing' | 'pending' {
  if (status === 2) return 'processing';
  if (status === 3) return 'success';
  if (status === 4) return 'failed';
  return 'pending';
}

function mapStatusToRowStatus(status: number): 'completed' | 'failed' {
  return status === 3 ? 'completed' : 'failed';
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-GB', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

function resolveSourceName(dataSourceId: string, datasources: Datasource[]): string {
  const ds = datasources.find((d) => d.id === dataSourceId);
  return ds ? ds.nameAr : dataSourceId.slice(0, 8) + '…';
}

// ── Mappers ─────────────────────────────────────────────────────────────────

export function toLogEntry(session: IngestionSession, datasources: Datasource[] = []): LogEntry {
  return {
    id: session.id,
    platform: session.dataSourceNameAr ?? resolveSourceName(session.dataSourceId, datasources),
    filename: session.fileName,
    records: session.rowsTotal,
    date: formatDate(session.createdAt),
    status: mapStatusInt(session.status),
  };
}

export function toImportRecord(session: IngestionSession, isRtl = false): ImportRecord {
  const dataSource = isRtl
    ? (session.dataSourceNameAr ?? session.dataSourceId.slice(0, 8) + '…')
    : (session.dataSourceNameEn ?? session.dataSourceId.slice(0, 8) + '…');
  return {
    id: session.id,
    fileName: session.fileName,
    dataSource,
    rowsTotal: session.rowsTotal,
    errorSummary: session.errorSummary,
    status: mapStatusToRowStatus(session.status),
    createdAt: formatDate(session.createdAt),
  };
}
