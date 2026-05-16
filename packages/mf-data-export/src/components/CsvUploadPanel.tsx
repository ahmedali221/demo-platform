import React, { useState, useRef, useEffect, DragEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { getDatasources, type Datasource } from '../api/datasources.service';
import { uploadIngestionFile, type UploadResult } from '../api/ingestion.service';

// ── Types ──────────────────────────────────────────────────────────────────

type Platform = 'keta' | 'hungerstation';

export interface CsvUploadPanelProps {
  activePlatform: Platform;
  onPlatformChange: (p: Platform) => void;
  platformTabs: { id: Platform; label: string }[];
  subtitle: string;
  steps: string;
  stepsLabel: string;
  t: (key: string, opts?: Record<string, string>) => string;
  onUploadSuccess?: () => void;
}

// ── Icons ──────────────────────────────────────────────────────────────────

const UploadIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2E75B6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
  </svg>
);

const FileIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const ArchiveIconSmall = () => (
  <div className="relative w-10 h-10">
    <svg width="32" height="40" viewBox="0 0 32 40" fill="none">
      <path d="M2.56 0C1.14615 0 0 1.11929 0 2.5V37.5C0 38.8807 1.14615 40 2.56 40H29.44C30.8538 40 32 38.8807 32 37.5V10L22 0H2.56Z" fill="#FFD166" />
      <path d="M32 10H24C22.8954 10 22 9.10457 22 8V0L32 10Z" fill="#FFF2CC" />
    </svg>
    <div className="absolute bottom-1 right-[-4px] bg-[#2E75B6] text-white text-[8px] font-bold px-1 rounded-sm">ZIP</div>
  </div>
);

const CloseCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="#EF4444" />
    <path d="M15 9L9 15M9 9L15 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

// ── Main Component ─────────────────────────────────────────────────────────

export default function CsvUploadPanel({
  activePlatform,
  onPlatformChange,
  platformTabs,
  subtitle,
  steps,
  stepsLabel,
  t,
  onUploadSuccess,
}: CsvUploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [datasources, setDatasources] = useState<Datasource[]>([]);
  const [loadingDatasources, setLoadingDatasources] = useState(true);
  const [selectedDatasourceId, setSelectedDatasourceId] = useState('');

  const abortRef = useRef<AbortController | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { i18n } = useTranslation();
  const siteLang = i18n.language;
  const isRtl = siteLang === 'ar';
  const langHint = siteLang === 'en'
    ? t('dataImport.uploadResult.langHintEn')
    : t('dataImport.uploadResult.langHintAr');

  useEffect(() => {
    getDatasources()
      .then((list) => {
        setDatasources(list);
        if (list.length > 0) setSelectedDatasourceId(list[0].id);
      })
      .catch(() => { /* non-fatal */ })
      .finally(() => setLoadingDatasources(false));
  }, [i18n.language]);

  const reset = () => {
    setPendingFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    setUploadResult(null);
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirm = async () => {
    if (!pendingFile || !selectedDatasourceId) return;

    abortRef.current = new AbortController();
    setIsUploading(true);
    setUploadProgress(0);
    setUploadResult(null);
    setUploadError(null);

    try {
      const result = await uploadIngestionFile(
        selectedDatasourceId,
        pendingFile,
        (pct) => setUploadProgress(pct),
        abortRef.current.signal,
      );
      setUploadResult(result);
      setIsUploading(false);
      setPendingFile(null);
      onUploadSuccess?.();
    } catch (err: unknown) {
      if ((err as { name?: string }).name === 'CanceledError' || (err as { name?: string }).name === 'AbortError') return;
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      setIsUploading(false);
    }

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    reset();
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) { reset(); setPendingFile(file); }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { reset(); setPendingFile(file); }
  };

  const isSuccess = uploadResult !== null;
  const isDuplicate = uploadResult?.isDuplicate === true;
  const isError = uploadError !== null;

  return (
    <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Platform tabs */}
      <div className="flex border-b border-gray-200">
        {platformTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { onPlatformChange(tab.id); reset(); }}
            className={`flex-1 p-2 text-sm font-bold transition-colors ${activePlatform === tab.id
              ? 'bg-[#2E75B6] text-white'
              : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 md:p-8">
        {/* Header */}
        <div className=" mb-5">
          <h2 className="text-lg font-black text-gray-900 mb-1">
            {t('dataImport.upload.title')}
          </h2>
          <p className="text-gray-400 text-sm">{subtitle}</p>
        </div>

        {/* Datasource dropdown */}
        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-700 mb-1.5 ">
            {t('importLogs.datasources')}
          </label>
          <div className="relative">
            <select
              dir={isRtl ? 'rtl' : 'ltr'}
              value={selectedDatasourceId}
              onChange={(e) => setSelectedDatasourceId(e.target.value)}
              disabled={loadingDatasources || datasources.length === 0}
              className={`w-full appearance-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#2E75B6] focus:border-transparent disabled:opacity-50 ${isRtl ? 'pr-4 pl-10' : 'pl-4 pr-10'}`}
            >
              {loadingDatasources && <option value="">{t('dataImport.uploadResult.loading')}</option>}
              {!loadingDatasources && datasources.length === 0 && <option value="">{t('dataImport.uploadResult.noSources')}</option>}
              {datasources.map((ds) => (
                <option key={ds.id} value={ds.id}>{isRtl ? ds.nameAr : ds.nameEn}</option>
              ))}
            </select>
            <div className={`pointer-events-none absolute inset-y-0 ${isRtl ? 'left-3' : 'right-3'} flex items-center text-gray-500`}>
              <ChevronDownIcon />
            </div>
          </div>
        </div>

        {/* Upload result panels */}
        {isSuccess && (
          <div className={`mb-4 rounded-2xl border p-5 ${isDuplicate ? 'border-yellow-300 bg-yellow-50' : 'border-green-300 bg-green-50'}`}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isDuplicate ? 'bg-yellow-100' : 'bg-green-100'}`}>
                {isDuplicate ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ca8a04" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`font-bold text-sm ${isDuplicate ? 'text-yellow-800' : 'text-green-800'}`}>
                  {isDuplicate ? t('dataImport.uploadResult.duplicate') : t('dataImport.uploadResult.success')}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t('dataImport.uploadResult.rowsInserted', { count: String(uploadResult!.rowsInserted) })}
                </p>
              </div>
            </div>
            <button
              onClick={reset}
              className="mt-3 w-full py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-white transition-colors"
            >
              {t('dataImport.uploadResult.uploadAnother')}
            </button>
          </div>
        )}

        {isError && (
          <div className="mb-4 rounded-2xl border border-red-300 bg-red-50 p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <div className=" flex-1">
                <p className="font-bold text-sm text-red-800">{t('dataImport.uploadResult.failedTitle')}</p>
                <p className="text-xs text-red-600 mt-0.5 break-all">{uploadError}</p>
              </div>
            </div>
            <button
              onClick={reset}
              className="mt-2 w-full py-2 text-sm font-bold text-gray-600 border border-gray-200 rounded-xl hover:bg-white transition-colors"
            >
              {t('dataImport.uploadResult.retry')}
            </button>
          </div>
        )}

        {/* Drop zone — hidden when result is shown */}
        {!isSuccess && !isError && (
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center transition-all duration-200 ${isDragging
              ? 'border-[#2E75B6] bg-[#EBF2F9]'
              : isUploading
                ? 'border-gray-200 bg-white'
                : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
            style={{ minHeight: '220px' }}
          >
            {isUploading ? (
              <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow p-6">
                <div className="flex justify-between items-center mb-6">
                  <button onClick={handleCancel} className="hover:bg-gray-100 p-1 rounded-full transition-colors">
                    <CloseCircleIcon />
                  </button>
                  <div className="">
                    <p className="text-base font-bold text-gray-900">جار التحميل...</p>
                    <p className="text-sm font-bold text-[#2E75B6] mt-1">{uploadProgress}%</p>
                  </div>
                </div>
                <div className="w-full bg-gray-200 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%`, backgroundColor: '#1E40AF' }}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl bg-[#EBF2F9] flex items-center justify-center mb-4">
                  <UploadIcon />
                </div>
                <p className="font-bold text-gray-900 text-base mb-1">
                  {t('dataImport.upload.dragText')}
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  {t('dataImport.upload.formatHint', { formats: 'CSV, XLSX', maxSize: '25MB' })}
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!selectedDatasourceId}
                  className="inline-flex items-center gap-2 bg-[#2E75B6] hover:bg-[#245E91] active:bg-[#1D4D78] text-white text-sm font-bold px-8 py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <FileIcon />
                  {t('dataImport.upload.uploadButton')}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </>
            )}
          </div>
        )}

        {/* Pending file confirmation */}
        {pendingFile && !isUploading && !isSuccess && !isError && (
          <div className="mt-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between shadow-sm mb-4">
              <button onClick={handleCancel} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <CloseCircleIcon />
              </button>
              <div className="flex items-center gap-3 ">
                <div>
                  <p className="text-sm font-bold text-gray-900">{pendingFile.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {(pendingFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <ArchiveIconSmall />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleConfirm}
                disabled={!selectedDatasourceId}
                className="flex-1 py-3 bg-[#2E75B6] hover:bg-[#245E91] text-white font-bold rounded-xl transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('dataImport.confirm.confirm')}
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 py-3 border border-red-200 text-red-500 font-bold rounded-xl hover:bg-red-50 transition-colors text-sm"
              >
                {t('dataImport.confirm.cancel')}
              </button>
            </div>
          </div>
        )}

        {/* Steps breadcrumb */}
        {!pendingFile && !isUploading && !isSuccess && !isError && (
          <div className="mt-6 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200">
              <InfoIcon />
              <span>
                <span className="font-bold text-gray-600">{stepsLabel}</span>{' '}
                {steps}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className="font-medium">{langHint}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
