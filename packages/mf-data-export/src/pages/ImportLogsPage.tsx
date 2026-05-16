import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import '../index.css';
import '../lib/registerTranslations';
import ImportLogsTable from '../components/ImportLogsTable';
import {
  getSummary, getImportHistory, getImportDetail, exportImportsCsv,
  toImportRecord,
  type IngestionSummary, type IngestionSession, type IngestionHistoryParams,
} from '../api/ingestion.service';
import {
  ExportIcon, RefreshIcon,
  ChevronDownIcon, SmallWarnIcon,
  FolderIcon, SmallFileIcon, SmallClockIcon,
  MotorcycleIcon,
} from '../components/icons';
import StrategyCard from '../components/StrategyCard';

// ── Types ──────────────────────────────────────────────────────────────────

type StatusFilter = null | 3 | 4; // null = All, 3 = Completed, 4 = Failed

const PAGE_SIZE = 20;

// ── Batch detail panel ─────────────────────────────────────────────────────

function BatchDetailPanel({ batchId, isRtl, t }: {
  batchId: string;
  isRtl: boolean;
  t: (key: string) => string;
}) {
  const [detail, setDetail] = useState<IngestionSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getImportDetail(batchId)
      .then(setDetail)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [batchId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-gray-400 font-cairo text-sm">
        {t('importLogs.loading')}
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="flex items-center justify-center py-16 text-red-500 font-cairo text-sm">
        {error ?? t('importLogs.emptyTable')}
      </div>
    );
  }

  const sourceName = isRtl
    ? (detail.dataSourceNameAr ?? detail.dataSourceId.slice(0, 8) + '…')
    : (detail.dataSourceNameEn ?? detail.dataSourceId.slice(0, 8) + '…');

  const statusLabels: Record<number, string> = {
    1: t('importLogs.table.statusPending'),
    2: t('importLogs.table.statusProcessing'),
    3: t('importLogs.table.statusCompleted'),
    4: t('importLogs.table.statusFailed'),
  };
  const statusColors: Record<number, string> = {
    1: 'bg-gray-100 text-gray-500',
    2: 'bg-blue-100 text-blue-700',
    3: 'bg-green-100 text-green-700',
    4: 'bg-red-100 text-red-700',
  };

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 font-cairo mb-1">{t('importLogs.detail.fileName')}</p>
          <p className="text-sm font-bold text-gray-800 truncate" title={detail.fileName}>{detail.fileName}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 font-cairo mb-1">{t('importLogs.detail.dataSource')}</p>
          <p className="text-sm font-bold text-gray-800">{sourceName}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 font-cairo mb-1">{t('importLogs.detail.status')}</p>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold font-cairo ${statusColors[detail.status] ?? 'bg-gray-100 text-gray-500'}`}>
            {statusLabels[detail.status] ?? detail.status}
          </span>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 font-cairo mb-1">{t('importLogs.detail.rowsTotal')}</p>
          <p className="text-sm font-bold text-gray-800">{detail.rowsTotal}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs text-gray-400 font-cairo mb-1">{t('importLogs.detail.createdAt')}</p>
          <p className="text-sm font-bold text-gray-800">{new Date(detail.createdAt).toLocaleString()}</p>
        </div>
        {detail.completedAt && (
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-400 font-cairo mb-1">{t('importLogs.detail.completedAt')}</p>
            <p className="text-sm font-bold text-gray-800">{new Date(detail.completedAt).toLocaleString()}</p>
          </div>
        )}
      </div>

      {detail.errorSummary && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-xs font-bold text-red-700 mb-2 font-cairo">{t('importLogs.detail.errorSummary')}</p>
          <pre className="text-xs text-red-800 whitespace-pre-wrap break-all font-mono">{detail.errorSummary}</pre>
        </div>
      )}
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function ImportLogsPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [searchParams, setSearchParams] = useSearchParams();
  const importId = searchParams.get('importId');

  const [statusFilter, setStatusFilter] = useState<StatusFilter>(null);
  const [page, setPage] = useState(1);

  const [summary, setSummary] = useState<IngestionSummary | null>(null);
  const [sessions, setSessions] = useState<IngestionSession[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Load summary cards once on mount
  useEffect(() => {
    getSummary().then(setSummary).catch(() => {});
  }, []);

  // Load table whenever page or status filter changes
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const params: IngestionHistoryParams = { page, pageSize: PAGE_SIZE };
    if (statusFilter != null) params.status = statusFilter;

    getImportHistory(params)
      .then(({ items, total: t }) => {
        if (cancelled) return;
        setSessions(items);
        setTotal(t);
      })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [page, statusFilter]);

  // Derive display records from raw sessions (locale-aware datasource name)
  const records = useMemo(
    () => sessions.map((s) => toImportRecord(s, isRtl)),
    [sessions, isRtl],
  );

  const handleStatusFilter = (status: StatusFilter) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const filters: Omit<IngestionHistoryParams, 'page' | 'pageSize'> = {};
      if (statusFilter != null) filters.status = statusFilter;
      await exportImportsCsv(filters);
    } catch { /* ignore */ } finally {
      setExporting(false);
    }
  };

  const formatLastImport = (iso: string | null | undefined): string => {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB'); // DD/MM/YYYY
  };

  const cards = [
    { color: '#6812D9', label: t('importLogs.stats.lastImport'),    value: formatLastImport(summary?.lastImportAt),               icon: <SmallClockIcon /> },
    { color: '#27AE60', label: t('importLogs.stats.failedBatches'), value: summary?.failedBatches?.toLocaleString() ?? '—',        icon: <SmallWarnIcon /> },
    { color: '#B83705', label: t('importLogs.stats.totalSessions'), value: summary?.totalSessions?.toLocaleString() ?? '—',        icon: <FolderIcon /> },
    { color: '#2E75B6', label: t('importLogs.stats.uniqueDrivers'), value: summary?.uniqueCouriers?.toLocaleString() ?? '—',       icon: <MotorcycleIcon /> },
    { color: '#C9A84C', label: t('importLogs.stats.totalRows'),     value: summary?.totalRows?.toLocaleString() ?? '—',            icon: <SmallFileIcon /> },
  ] as const;

  return (
    <div className="flex-1 p-4 md:p-8 overflow-auto min-w-0 flex flex-col gap-6" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row items-start md:justify-between gap-3">
        <div className="text-start">
          <h1 className="hidden md:block text-2xl font-black text-gray-900 font-arabic mb-1">
            {t('importLogs.pageTitle')}
          </h1>
          <p className="text-gray-400 text-sm font-arabic">
            {t('importLogs.pageSubtitle')}
          </p>
        </div>
        {importId && (
          <button
            onClick={() => setSearchParams({})}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold font-cairo text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {isRtl
                ? <polyline points="9 18 15 12 9 6" />
                : <polyline points="15 18 9 12 15 6" />}
            </svg>
            {t('importLogs.backToSessions')}
          </button>
        )}
      </div>

      {/* ── Stats row ── */}
      <div className="flex flex-wrap gap-3 md:gap-4">
        {cards.map((card) => (
          <div key={card.label} className="flex-1 min-w-[calc(50%-6px)] md:min-w-0">
            <StrategyCard
              title={card.value}
              description={card.label}
              icon={card.icon}
              accentColor={card.color}
              active={true}
            />
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-3 flex-wrap">

          {/* Status filter group */}
          <div className="flex items-center gap-1.5 bg-white rounded-lg border border-gray-200 shadow-sm px-2 py-1">
            <div className="pe-2.5 border-e border-zinc-300 flex items-center">
              <span className="text-sm font-semibold text-black font-cairo whitespace-nowrap">{t('importLogs.filters.statusLabel')}</span>
            </div>
            <button onClick={() => handleStatusFilter(null)}
              className={`py-1.5 px-3 rounded-lg text-xs font-cairo transition-colors ${statusFilter === null ? 'bg-[rgba(245,158,11,0.10)] text-[#D2A947] font-bold' : 'text-black hover:bg-gray-50'}`}>
              {t('importLogs.filters.all')}
            </button>
            <button onClick={() => handleStatusFilter(3)}
              className={`py-1.5 px-3 flex items-center gap-1.5 rounded-lg transition-colors ${statusFilter === 3 ? 'bg-[rgba(245,158,11,0.10)]' : 'hover:bg-gray-50'}`}>
              <span className={`text-xs font-cairo ${statusFilter === 3 ? 'text-[#D2A947] font-bold' : 'text-black'}`}>{t('importLogs.filters.healthy')}</span>
              <span className="w-2 h-2 rounded-full shrink-0 bg-[#22c55e]" />
            </button>
            <button onClick={() => handleStatusFilter(4)}
              className={`py-1.5 px-3 flex items-center gap-1.5 rounded-lg transition-colors ${statusFilter === 4 ? 'bg-[rgba(245,158,11,0.10)]' : 'hover:bg-gray-50'}`}>
              <span className={`text-xs font-cairo ${statusFilter === 4 ? 'text-[#D2A947] font-bold' : 'text-black'}`}>{t('importLogs.filters.failed')}</span>
              <span className="w-2 h-2 rounded-full shrink-0 bg-[#ef4444]" />
            </button>
          </div>

        </div>

        {/* Table title + export */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <h2 className="text-black text-xl font-bold">{t('importLogs.pageTitle')}</h2>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="px-4 py-1.5 bg-[#1D3478] hover:bg-[#255f96] disabled:opacity-60 rounded-lg text-white text-xs font-bold font-cairo transition-colors">
            {exporting ? '…' : t('importLogs.session.exportCsv')}
          </button>
        </div>
      </div>

      {/* ── Table / Detail ── */}
      <div className="bg-white rounded-2xl overflow-hidden">
        {importId ? (
          <BatchDetailPanel batchId={importId} isRtl={isRtl} t={t} />
        ) : (
          <>
            {loading && (
              <div className="flex items-center justify-center py-16 text-gray-400 font-cairo text-sm">
                {t('importLogs.loading')}
              </div>
            )}
            {!loading && error && (
              <div className="flex items-center justify-center py-16 text-red-500 font-cairo text-sm">
                {error}
              </div>
            )}
            {!loading && !error && records.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <rect x="10" y="6" width="28" height="36" rx="4" fill="#F3F4F6" />
                  <line x1="16" y1="17" x2="32" y2="17" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="16" y1="24" x2="32" y2="24" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="16" y1="31" x2="24" y2="31" stroke="#D1D5DB" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <span className="text-sm font-bold font-cairo">{t('importLogs.emptyTable')}</span>
              </div>
            )}
            {!loading && !error && records.length > 0 && (
              <ImportLogsTable
                records={records}
                total={total}
                page={page}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
                t={t}
              />
            )}
          </>
        )}
      </div>

    </div>
  );
}
