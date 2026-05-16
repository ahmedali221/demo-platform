import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../index.css';
import '../lib/registerTranslations';
import { getImportDetail, type IngestionSession } from '../api/ingestion.service';

export default function ImportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';

  const [detail, setDetail] = useState<IngestionSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getImportDetail(id)
      .then(setDetail)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

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
    <div className="flex-1 p-4 md:p-8 overflow-auto min-w-0 flex flex-col gap-6" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 font-arabic mb-1">
            {t('importLogs.detail.pageTitle')}
          </h1>
          <p className="text-gray-400 text-sm font-arabic">
            {t('importLogs.detail.pageSubtitle')}
          </p>
        </div>
        <button
          onClick={() => navigate('/import-logs')}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold font-cairo text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            {isRtl
              ? <polyline points="9 18 15 12 9 6" />
              : <polyline points="15 18 9 12 15 6" />}
          </svg>
          {t('importLogs.backToSessions')}
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-2xl overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400 font-cairo text-sm">
            {t('importLogs.loading')}
          </div>
        )}

        {!loading && (error || !detail) && (
          <div className="flex items-center justify-center py-16 text-red-500 font-cairo text-sm">
            {error ?? t('importLogs.emptyTable')}
          </div>
        )}

        {!loading && detail && (
          <div className="p-6 flex flex-col gap-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 font-cairo mb-1">{t('importLogs.detail.fileName')}</p>
                <p className="text-sm font-bold text-gray-800 truncate" title={detail.fileName}>{detail.fileName}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 font-cairo mb-1">{t('importLogs.detail.dataSource')}</p>
                <p className="text-sm font-bold text-gray-800">
                  {isRtl
                    ? (detail.dataSourceNameAr ?? detail.dataSourceId.slice(0, 8) + '…')
                    : (detail.dataSourceNameEn ?? detail.dataSourceId.slice(0, 8) + '…')}
                </p>
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
        )}
      </div>
    </div>
  );
}
