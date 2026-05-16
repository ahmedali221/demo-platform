import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { DotsIcon } from './icons';

// ── Types ──────────────────────────────────────────────────────────────────

export type RowStatus = 'completed' | 'failed';

export interface ImportRecord {
  id: string;
  fileName: string;
  dataSource: string;
  rowsTotal: number;
  errorSummary: string | null;
  status: RowStatus;
  createdAt: string;
}

// ── Internal ───────────────────────────────────────────────────────────────

const STATUS_STRIPE: Record<RowStatus, string> = {
  completed: '#22c55e',
  failed:    '#ef4444',
};

const SOURCE_BADGE: Record<string, { bg: string; text: string }> = {
  keta:         { bg: '#EDE9FE', text: '#7C3AED' },
  hungerstation:{ bg: '#FEF3C7', text: '#D97706' },
  manfer:       { bg: '#DBEAFE', text: '#1D4ED8' },
  jahiz:        { bg: '#FCE7F3', text: '#BE185D' },
  hunger:       { bg: '#FEE2E2', text: '#DC2626' },
};

const Th = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <th className={`py-4 text-start px-3 ${className}`}>
    <span className="text-white text-xs font-bold font-cairo tracking-[0.5px] uppercase whitespace-nowrap">
      {children}
    </span>
  </th>
);

const ChevronIcon = ({ dir }: { dir: 'right' | 'left' }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    {dir === 'right'
      ? <polyline points="9 18 15 12 9 6" />
      : <polyline points="15 18 9 12 15 6" />}
  </svg>
);

// ── Component ──────────────────────────────────────────────────────────────

export interface ImportLogsTableProps {
  records: ImportRecord[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}

// ── Session rows table ─────────────────────────────────────────────────────

const STATUS_ROW_COLOR: Record<string, { bg: string; text: string }> = {
  active:     { bg: '#E2EFEB', text: '#47AD82' },
  inactive:   { bg: '#FEE2E2', text: '#EF4444' },
  suspended:  { bg: '#FEF3C7', text: '#D97706' },
  pending:    { bg: '#DBEAFE', text: '#1D4ED8' },
};

export interface SessionDataTableProps {
  items: Record<string, unknown>[];
  totalCount: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  t: (key: string, opts?: Record<string, unknown>) => string;
}

// Convert camelCase key → readable header label
function toHeader(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

const ROW_STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  completed:  { bg: '#E2EFEB', text: '#47AD82' },
  warning:    { bg: '#FEF3C7', text: '#D97706' },
  failed:     { bg: '#FEE2E2', text: '#EF4444' },
  processing: { bg: '#DBEAFE', text: '#1D4ED8' },
};

export function SessionDataTable({ items, totalCount, page, pageSize, onPageChange, t }: SessionDataTableProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const columns = items.length > 0 ? Object.keys(items[0]) : [];
  const dataColumns = columns.filter((c) => c !== 'rowStatus');

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const from = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalCount);

  const pageNumbers: (number | '…')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pageNumbers.push(i);
    } else if (pageNumbers[pageNumbers.length - 1] !== '…') {
      pageNumbers.push('…');
    }
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="bg-[#2E75B6]">
              <th className="w-1 p-0" />
              {dataColumns.map((col) => (
                <Th key={col}>{toHeader(col)}</Th>
              ))}
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {items.map((row, idx) => {
              const statusRaw = String(row.rowStatus ?? '').toLowerCase();
              const badge = ROW_STATUS_COLOR[statusRaw] ?? { bg: '#F3F4F6', text: '#6B7280' };
              return (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="w-1 p-0">
                    <div className="w-1 min-h-[56px] h-full rounded-sm" style={{ backgroundColor: badge.text }} />
                  </td>
                  {dataColumns.map((col) => (
                    <td key={col} className="py-4 px-3 text-start text-xs text-gray-700 max-w-[160px]">
                      <span className="block truncate" title={String(row[col] ?? '')}>
                        {String(row[col] ?? '—')}
                      </span>
                    </td>
                  ))}
                  <td className="py-4 px-3 text-start">
                    <span
                      className="inline-flex items-center justify-center min-w-[90px] text-xs font-bold px-3 py-1.5 rounded-full font-cairo"
                      style={{ backgroundColor: badge.bg, color: badge.text }}
                    >
                      {String(row.rowStatus ?? '—')}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 px-4 py-3 border-t border-gray-100 bg-white">
        <span className="text-xs text-gray-400 font-cairo">
          {from}–{to} {t('importLogs.table.pagination.of')} {totalCount} {t('importLogs.table.pagination.records')}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronIcon dir={isRtl ? 'right' : 'left'} />
          </button>
          {pageNumbers.map((n, i) =>
            n === '…' ? (
              <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
            ) : (
              <button
                key={n}
                onClick={() => onPageChange(n)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                  page === n ? 'bg-[#2E75B6] text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {n}
              </button>
            )
          )}
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronIcon dir={isRtl ? 'left' : 'right'} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ImportLogsTable({ records, total, page, pageSize, onPageChange, t }: ImportLogsTableProps) {
  const { i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [searchParams, setSearchParams] = useSearchParams();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, total);

  const pageNumbers: (number | '…')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pageNumbers.push(i);
    } else if (pageNumbers[pageNumbers.length - 1] !== '…') {
      pageNumbers.push('…');
    }
  }

  return (
    <div dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-arabic min-w-[640px]">
          <thead>
            <tr className="bg-[#2E75B6]">
              <th className="w-1 p-0" />
              <th className="py-4 px-3 text-start">
                <span className="text-white text-xs font-bold font-cairo tracking-[0.5px] whitespace-nowrap">
                  {t('importLogs.table.date')}
                </span>
              </th>
              <Th>{t('importLogs.table.importId')}</Th>
              <Th>{t('importLogs.table.fileName')}</Th>
              <Th>{t('importLogs.table.dataSource')}</Th>
              <Th>{t('importLogs.table.rows')}</Th>
              <Th>{t('importLogs.table.status')}</Th>
              <Th>{t('importLogs.table.actions')}</Th>
            </tr>
          </thead>

          <tbody className="bg-white">
            {records.map((row) => {
              const isHighlight = row.status === 'failed';
              const stripeColor = STATUS_STRIPE[row.status];
              const sourceKey = row.dataSource.toLowerCase();
              const sourceBadge = SOURCE_BADGE[sourceKey] ?? { bg: '#F3F4F6', text: '#6B7280' };
              return (
                <tr key={row.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${isHighlight ? 'bg-[#E8F0F8]' : ''}`}>

                  {/* Status stripe */}
                  <td className="w-1 p-0">
                    <div className="w-1 min-h-[56px] h-full rounded-sm" style={{ backgroundColor: stripeColor }} />
                  </td>

                  {/* Date */}
                  <td className="py-5 px-3 text-start text-gray-500 text-xs whitespace-nowrap">
                    {row.createdAt}
                  </td>

                  {/* Import ID */}
                  <td className="py-5 text-start px-3">
                    <span className="text-[#2E75B6] font-bold text-xs font-inter">
                      #{row.id.slice(0, 8)}…
                    </span>
                  </td>

                  {/* File Name */}
                  <td className="py-5 text-start px-3 font-semibold text-gray-800 text-xs max-w-[180px]">
                    <span className="block truncate" title={row.fileName}>
                      {row.fileName}
                    </span>
                  </td>

                  {/* Data Source */}
                  <td className="py-5 text-start px-3 max-w-[120px]">
                    <span
                      className="inline-block truncate font-inter text-[11px] font-bold px-3 py-1 rounded-full"
                      style={{ backgroundColor: sourceBadge.bg, color: sourceBadge.text }}
                      title={row.dataSource}
                    >
                      {row.dataSource.toUpperCase()}
                    </span>
                  </td>

                  {/* Rows */}
                  <td className="py-5 px-3">
                    <span className="text-[11px] font-bold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md whitespace-nowrap">
                      {row.rowsTotal}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-5 text-start px-3">
                    <div className="flex justify-start">
                      {row.status === 'completed' && (
                        <span className="inline-flex items-center justify-center min-w-[110px] bg-[#dcfce7] text-[#16a34a] text-xs font-bold px-4 py-2 rounded-full font-cairo">
                          {t('importLogs.table.statusCompleted')}
                        </span>
                      )}
                      {row.status === 'failed' && (
                        <span className="inline-flex items-center justify-center min-w-[110px] bg-[#fee2e2] text-[#ef4444] text-xs font-bold px-4 py-2 rounded-full gap-2 font-cairo shadow-sm">
                          <span className="text-sm font-black -mt-0.5">!</span>
                          {t('importLogs.table.statusFailed')}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-5 text-start px-3 relative">
                    <button 
                      onClick={() => setOpenDropdown(openDropdown === row.id ? null : row.id)}
                      className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-white transition-all shadow-sm active:scale-95"
                    >
                      <DotsIcon />
                    </button>
                    {openDropdown === row.id && (
                      <div className={`absolute top-full mt-1 ${isRtl ? 'left-8' : 'right-8'} bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px] py-1`}>
                        <button 
                          onClick={() => {
                             setSearchParams({ importId: row.id });
                             setOpenDropdown(null);
                          }}
                          className="w-full text-start px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 font-cairo"
                        >
                          {t('importLogs.table.viewDetails', 'View Details')}
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex flex-wrap items-center justify-between gap-y-2 px-4 py-3 border-t border-gray-100 bg-white">
        <span className="text-xs text-gray-400 font-cairo">
          {from}–{to} {t('importLogs.table.pagination.of')} {total} {t('importLogs.table.pagination.records')}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronIcon dir={isRtl ? 'right' : 'left'} />
          </button>
          {pageNumbers.map((n, i) =>
            n === '…' ? (
              <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
            ) : (
              <button
                key={n}
                onClick={() => onPageChange(n)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                  page === n ? 'bg-[#2E75B6] text-white' : 'text-gray-500 hover:bg-gray-100'
                }`}
              >
                {n}
              </button>
            )
          )}
          <button
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronIcon dir={isRtl ? 'left' : 'right'} />
          </button>
        </div>
      </div>
    </div>
  );
}
