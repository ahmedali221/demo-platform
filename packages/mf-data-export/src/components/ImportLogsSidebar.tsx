import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

const PAGE_SIZE = 5;

// ── Types ──────────────────────────────────────────────────────────────────

export interface LogEntry {
  id: string;
  platform: string;
  filename: string;
  records: number;
  date: string;
  status: 'success' | 'warning' | 'failed' | 'processing' | 'pending';
}

export interface ImportLogsSidebarProps {
  logs: LogEntry[];
  onViewAll: () => void;
  onViewSession?: (id: string) => void;
}

// ── Icons ──────────────────────────────────────────────────────────────────

const LogsDocIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path
      d="M3 2.5A1.5 1.5 0 0 1 4.5 1h6.25L15 5.5V15.5A1.5 1.5 0 0 1 13.5 17h-9A1.5 1.5 0 0 1 3 15.5V2.5z"
      fill="#C9A84C"
    />
    <path d="M10.75 1v4.5H15" stroke="rgba(0,0,0,0.18)" strokeWidth="0.75" fill="none" />
    <line x1="5.5" y1="9" x2="12.5" y2="9" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
    <line x1="5.5" y1="12" x2="10.5" y2="12" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const SuccessCircle = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="9" fill="#27AE60" />
    <polyline
      points="5.4,9 7.5,11.1 12.6,6.3"
      stroke="white"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const WarningTriangle = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M9 1.5L16.8 15.75H1.2L9 1.5z" fill="#FCBE04" />
    <line x1="9" y1="7.5" x2="9" y2="11" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    <circle cx="9" cy="12.75" r="0.85" fill="white" />
  </svg>
);

const FailCircle = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="9" fill="#EF4444" />
    <path d="M12 6L6 12M6 6L12 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Sub-components ─────────────────────────────────────────────────────────

const PlatformBadge = ({ platform }: { platform: string }) => {
  const label = platform.length > 12 ? platform.slice(0, 8) + '…' : platform;
  return (
    <div style={{
      paddingLeft: 6,
      paddingRight: 6,
      paddingTop: 4,
      paddingBottom: 4,
      background: 'rgba(46,117,182,0.10)',
      borderRadius: 222,
      outline: '1px rgba(46,117,182,0.30) solid',
      outlineOffset: '-1px',
      color: '#2E75B6',
      fontSize: 10,
      fontFamily: 'Cairo',
      fontWeight: 700,
      lineHeight: '15px',
      whiteSpace: 'nowrap' as const,
    }}>
      {label}
    </div>
  );
};

const StatusLabel = ({ status, t }: { status: LogEntry['status']; t: (key: string) => string }) => {
  const isSuccess = status === 'success';
  const isFailed = status === 'failed';
  const color = isSuccess ? '#27AE60' : isFailed ? '#EF4444' : '#FB923C';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {isSuccess ? <SuccessCircle /> : isFailed ? <FailCircle /> : <WarningTriangle />}
      <span style={{
        color: color,
        fontSize: 12,
        fontFamily: 'Cairo',
        fontWeight: 700,
        lineHeight: '16px',
      }}>
        {t(`importLogs.sidebar.status.${status}`)}
      </span>
    </div>
  );
};

// ── Component ──────────────────────────────────────────────────────────────

export default function ImportLogsSidebar({ logs, onViewAll, onViewSession }: ImportLogsSidebarProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const pagedLogs = logs.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  const goBack = () => setPage(p => Math.max(0, p - 1));
  const goForward = () => setPage(p => Math.min(totalPages - 1, p + 1));

  return (
    <div style={{
      flex: 1,
      minWidth: 0,
      background: 'white',
    
      borderRadius: 16,
      border: '0.25px #A2A2A2 solid',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '24px 27px 16px',
      }}>
        {/* Title + icon — RIGHT in RTL (first in DOM) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 32,
            height: 32,
            paddingLeft: 7,
            paddingRight: 7,
            paddingTop: 7,
            paddingBottom: 7,
            background: 'white',
            
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <LogsDocIcon />
          </div>
          <span style={{
            color: 'black',
            fontSize: 14,
            fontFamily: 'Cairo',
            fontWeight: 700,
            lineHeight: '19.88px',
            whiteSpace: 'nowrap',
          }}>
            {t('importLogs.sidebar.title')}
          </span>
        </div>

        {/* "عرض الكل" — LEFT in RTL (second in DOM) */}
        <button
          onClick={onViewAll}
          style={{
            padding: '3px 10px',
            background: 'rgba(255, 209, 102, 0.25)',
            borderRadius: 222,
            outline: '1px #C9A84C solid',
            outlineOffset: '-1px',
            border: 'none',
            color: '#C9A84C',
            fontSize: 12,
            fontFamily: 'Cairo',
            fontWeight: 700,
            lineHeight: '17.04px',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          {t('importLogs.sidebar.viewAll')}
        </button>
      </div>

      {/* ── Items list ── */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 27px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}>
        {logs.length === 0 && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingTop: 32,
            paddingBottom: 32,
            color: '#A2A2A2',
          }}>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="8" y="5" width="24" height="30" rx="3" fill="#E5E5E5" />
              <line x1="13" y1="14" x2="27" y2="14" stroke="#C4C4C4" strokeWidth="2" strokeLinecap="round" />
              <line x1="13" y1="20" x2="27" y2="20" stroke="#C4C4C4" strokeWidth="2" strokeLinecap="round" />
              <line x1="13" y1="26" x2="21" y2="26" stroke="#C4C4C4" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span style={{ fontFamily: 'Cairo', fontSize: 12, fontWeight: 600 }}>
              {t('importLogs.sidebar.empty')}
            </span>
          </div>
        )}
        {pagedLogs.map((log, index) => {
          const isLast = index === pagedLogs.length - 1;
          return (
            <button
              key={log.id}
              onClick={() => onViewSession ? onViewSession(log.id) : onViewAll()}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                paddingTop: 6,
                paddingBottom: 6,
                borderBottom: isLast ? 'none' : '1px #E5E5E5 solid',
                background: 'none',
                border: isLast ? 'none' : undefined,
                borderTop: 'none',
                borderLeft: 'none',
                borderRight: 'none',
                cursor: 'pointer',
                width: '100%',
                textAlign: 'inherit',
              }}
            >
              {/* Top row: platform badge (right) + status (left) */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                {/* Platform badge — RIGHT in RTL (first in DOM) */}
                <PlatformBadge platform={log.platform} />
                {/* Status — LEFT in RTL (second in DOM) */}
                <StatusLabel status={log.status} t={t} />
              </div>

              {/* File info */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                alignItems: 'flex-start',
              }}>
                <span style={{
                  color: 'black',
                  fontSize: 14,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  lineHeight: '20px',
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {log.filename}
                </span>
                <span style={{
                  color: '#6B7280',
                  fontSize: 10,
                  lineHeight: '15px',
                  direction: 'ltr',
                }}>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>{log.records} </span>
                  <span style={{ fontFamily: 'Cairo', fontWeight: 400 }}>{t('importLogs.sidebar.record')}</span>
                  <span style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400 }}> . {log.date}</span>
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Pagination ── */}
      {logs.length > 0 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: '10px 27px 16px',
          borderTop: '1px #E5E5E5 solid',
        }}>
          {/* Prev button — left arrow in LTR, right arrow in RTL */}
          <button
            onClick={goBack}
            disabled={page === 0}
            style={{
              width: 28,
              height: 28,
              border: 'none',
              borderRadius: 6,
              background: page === 0 ? '#F3F4F6' : 'rgba(46,117,182,0.10)',
              color: page === 0 ? '#C4C4C4' : '#2E75B6',
              cursor: page === 0 ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              {isRtl
                ? <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                : <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              }
            </svg>
          </button>

          <span style={{
            fontFamily: 'Cairo',
            fontSize: 12,
            fontWeight: 700,
            color: '#6B7280',
            minWidth: 60,
            textAlign: 'center',
          }}>
            {page + 1} / {totalPages}
          </span>

          {/* Next button — right arrow in LTR, left arrow in RTL */}
          <button
            onClick={goForward}
            disabled={page === totalPages - 1}
            style={{
              width: 28,
              height: 28,
              border: 'none',
              borderRadius: 6,
              background: page === totalPages - 1 ? '#F3F4F6' : 'rgba(46,117,182,0.10)',
              color: page === totalPages - 1 ? '#C4C4C4' : '#2E75B6',
              cursor: page === totalPages - 1 ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              {isRtl
                ? <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                : <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              }
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
