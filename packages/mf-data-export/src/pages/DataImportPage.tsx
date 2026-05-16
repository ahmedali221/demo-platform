import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { NavItemId } from '@ops-brain/shared';
import '../index.css';
import '../lib/registerTranslations';
import StrategyCard from '../components/StrategyCard';
import type { BadgeConfig } from '../components/StrategyCard';
import ImportLogsSidebar from '../components/ImportLogsSidebar';
import CsvUploadPanel from '../components/CsvUploadPanel';
import { useIngestionHistory } from '../hooks/useIngestionHistory';
import { toLogEntry } from '../api/ingestion.service';
import { getDatasources, type Datasource } from '../api/datasources.service';

type Strategy = 'csv' | 'manual' | 'browser';
type Platform = 'keta';

const CsvIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const ManualIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const BrowserIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);



export interface DataImportPageProps {
  onNavigate?: (id: NavItemId) => void;
}

export default function DataImportPage({ onNavigate }: DataImportPageProps = {}) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const [activeStrategy, setActiveStrategy] = useState<Strategy>('csv');
  const [activePlatform, setActivePlatform] = useState<Platform>('keta');
  const { sessions, refetch } = useIngestionHistory();
  const [datasources, setDatasources] = useState<Datasource[]>([]);
  useEffect(() => {
    getDatasources().then(setDatasources).catch(() => {});
  }, []);
  const recentLogs = sessions.map((s) => toLogEntry(s, datasources));
  // ── Strategy accent colors ────────────────────────────────────────────────
  // #2E75B6  csv      — blue  (matches upload panel & tabs)
  // #C9A84C  manual   — gold  (primary brand color)
  // #9CA3AF  browser  — gray  (disabled / coming soon)

  const strategies: {
    id: Strategy;
    title: string;
    description: string;
    icon: React.ReactNode;
    badges: BadgeConfig[];
    accentColor: string;
    disabled?: boolean;
  }[] = [
      {
        id: 'csv',
        title: t('dataImport.strategies.csv.title'),
        description: t('dataImport.strategies.csv.description'),
        icon: <CsvIcon />,
        accentColor: '#C9A84C',
        badges: [
          { label: t('dataImport.strategies.csv.badge'), variant: 'green' },
          { label: t('dataImport.strategies.csv.extraBadge'), variant: 'yellow' },
        ],
      },
      {
        id: 'manual',
        title: t('dataImport.strategies.manual.title'),
        description: t('dataImport.strategies.manual.description'),
        icon: <ManualIcon />,
        accentColor: '#2E75B6',
        badges: [
          { label: t('dataImport.strategies.manual.badge'), variant: 'green' },
        ],
      },
      {
        id: 'browser',
        title: t('dataImport.strategies.browser.title'),
        description: t('dataImport.strategies.browser.description'),
        icon: <BrowserIcon />,
        accentColor: '#202046',
        badges: [
          { label: t('dataImport.strategies.browser.badge'), variant: 'gray' },
        ],
        disabled: true,
      },
    ];

  const platformTabs: { id: Platform; label: string }[] = [
    { id: 'keta', label: t('dataImport.platforms.keta') },
    // { id: 'hungerstation', label: t('dataImport.platforms.hungerstation') },
  ];

  const uploadConfig = {
    keta: {
      subtitle: t('dataImport.upload.subtitleKeta'),
      steps: t('dataImport.upload.stepsKeta'),
    },
    // hungerstation: {
    //   subtitle: t('dataImport.upload.subtitleHungerstation'),
    //   steps: t('dataImport.upload.stepsHungerstation'),
    // },
  };

  // react-router-dom is a shared singleton in MF config — useNavigate uses the host's router
  const navigate = useNavigate();
  const handleNavigate = (id: NavItemId) => {
    if (onNavigate) { onNavigate(id); return; }
    navigate(`/${id}`);
  };

  const config = uploadConfig[activePlatform];

  return (
    <div className="flex-1 p-4 md:p-8 overflow-auto" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Page header */}
        <div className="mb-5 md:mb-8 text-start">
          <h1 className="text-2xl font-black text-gray-900 mb-1">
            {t('dataImport.pageTitle')}
          </h1>
          <p className="text-gray-400 text-sm">
            {t('dataImport.pageSubtitle')}
          </p>
        </div>

        {/* Strategy cards */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {strategies.map((strategy) => (
            <div key={strategy.id} className="flex-1 min-w-0">
              <StrategyCard
                title={strategy.title}
                description={strategy.description}
                icon={strategy.icon}
                badges={strategy.badges}
                accentColor={strategy.accentColor}
                active={activeStrategy === strategy.id}
                disabled={strategy.disabled}
                onClick={() => setActiveStrategy(strategy.id)}
              />
            </div>
          ))}
        </div>

        {/* CSV upload panel + logs sidebar */}
        {activeStrategy === 'csv' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

            <div className="min-w-0">
              <CsvUploadPanel
                activePlatform={activePlatform}
                onPlatformChange={setActivePlatform}
                platformTabs={platformTabs}
                subtitle={config.subtitle}
                steps={config.steps}
                stepsLabel={t('dataImport.upload.stepsLabel', {
                  platform: t(`dataImport.platforms.${activePlatform}`),
                })}
                t={t}
                onUploadSuccess={refetch}
              />
            </div>

            <div className="min-w-0 flex flex-col">
              <ImportLogsSidebar
                logs={recentLogs}
                onViewAll={() => handleNavigate('import-logs')}
                onViewSession={(id) => navigate(`/import-logs?importId=${id}`)}
              />
            </div>

          </div>
        )}

        {/* Manual entry placeholder */}
        {activeStrategy === 'manual' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4 text-green-500">
              <ManualIcon />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              {t('dataImport.manualTitle')}
            </h2>
            <p className="text-gray-400 text-sm">
              {t('dataImport.manualDesc')}
            </p>
          </div>
        )}
    </div>
  );
}
