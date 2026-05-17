import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import axios from "axios";
import "../lib/registerTranslations";
import "../index.css";
import StrategyCard from "../components/StrategyCard";
import { ForbiddenPage } from "@ops-brain/shared";
import {
  getCompanySummary,
  getCompanyLive,
  CompanySummary,
  CompanyLive,
} from "../api/companies.service";

// ─── Icons ────────────────────────────────────────────────────────────────────

const CompletedIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const RejectedIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const CancelIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

const ClockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const ShiftIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const EfficiencyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

const CourierIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" />
    <path d="M5.5 20a7 7 0 0 1 13 0" />
  </svg>
);

const DeliveryIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="1" />
    <path d="M16 8h4l3 5v3h-7V8z" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const StarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const LiveDotIcon = () => (
  <span className="relative flex h-2.5 w-2.5">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
  </span>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtNum(val: number | null): string {
  if (val === null) return "—";
  return String(val);
}

function fmtPct(val: number | null): string {
  if (val === null) return "—";
  return `${(val * 100).toFixed(1)}%`;
}

function fmtRelativeTime(utcStr: string): string {
  const diff = Math.floor((Date.now() - new Date(utcStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Reports Tab ──────────────────────────────────────────────────────────────

type PeriodFilter = 1 | 2 | 3; // 1=Daily, 2=Weekly, 3=Monthly

function ReportsTab({ t }: { t: TFunction }) {
  const [period, setPeriod] = useState<PeriodFilter>(1);
  const [data, setData] = useState<CompanySummary | null>(null);
  const [noData, setNoData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setNoData(false);
    setError(null);
    getCompanySummary({ periodType: period })
      .then((res) => {
        if (res === null) setNoData(true);
        else setData(res);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [period]);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
        {t("reports.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-red-500">
        {error}
      </div>
    );
  }

  if (noData || !data) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
        {t("reports.noData")}
      </div>
    );
  }

  // Build rows for the KPI table
  const kpiRows: { key: string; value: string; icon: React.ReactNode; color: string }[] = [
    { key: "onTimeRate",             value: fmtPct(data.onTimeRate),             icon: <ClockIcon />,      color: "#2E75B6" },
    { key: "cancellationRate",       value: fmtPct(data.cancellationRate),       icon: <CancelIcon />,     color: "#27AE60" },
    { key: "avgRejectionRate",       value: fmtPct(data.avgRejectionRate),       icon: <RejectedIcon />,   color: "#EF4444" },
    { key: "avgShiftAttendanceRate", value: fmtPct(data.avgShiftAttendanceRate), icon: <ShiftIcon />,      color: "#D97706" },
    { key: "operationalEfficiency",  value: fmtNum(data.operationalEfficiency),  icon: <EfficiencyIcon />, color: "#7C3AED" },
    { key: "avgDeliveryMin",         value: fmtNum(data.avgDeliveryMin),         icon: <DeliveryIcon />,   color: "#0891B2" },
    { key: "courierEfficiency",      value: fmtNum(data.courierEfficiency),      icon: <StarIcon />,       color: "#16A34A" },
    { key: "largeOrderOnTimeRate",   value: fmtPct(data.largeOrderOnTimeRate),   icon: <ClockIcon />,      color: "#9333EA" },
    { key: "activeCouriersCount",    value: fmtNum(data.activeCouriersCount),    icon: <CourierIcon />,    color: "#F59E0B" },
    { key: "totalWorkingDays",       value: fmtNum(data.totalWorkingDays),       icon: <CalendarIcon />,   color: "#6B7280" },
  ];

  const handleExport = () => {
    const rows = kpiRows.map((r) => ({
      [t("reports.companies.columns.indicator")]: t(`reports.companies.kpis.${r.key}`),
      [t("reports.companies.columns.currentValue")]: r.value,
    }));
    rows.push(
      { [t("reports.companies.columns.indicator")]: t("reports.companies.stats.completed"),  [t("reports.companies.columns.currentValue")]: fmtNum(data.totalTasksDelivered) },
      { [t("reports.companies.columns.indicator")]: t("reports.companies.stats.cancelled"),  [t("reports.companies.columns.currentValue")]: fmtNum(data.totalTasksCancelled) },
      { [t("reports.companies.columns.indicator")]: t("reports.companies.stats.rejected"),   [t("reports.companies.columns.currentValue")]: fmtNum(data.totalTasksRejected) },
    );
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t("reports.companies.title"));
    XLSX.writeFile(wb, "company-report.xlsx");
  };

  const periodTabs: { id: PeriodFilter; label: string }[] = [
    { id: 1, label: t("reports.filter.daily") },
    { id: 2, label: t("reports.filter.weekly") },
    { id: 3, label: t("reports.filter.monthly") },
  ];

  return (
    <>
      {/* ── Period filter tabs ── */}
      <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm w-fit">
        {periodTabs.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
              period === p.id ? "bg-[#1D3478] text-white" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* ── Top stats: 3 order count cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StrategyCard
          title={fmtNum(data.totalTasksDelivered)}
          description={t("reports.companies.stats.completed")}
          accentColor="#27AE60"
          icon={<CompletedIcon />}
        />
        <StrategyCard
          title={fmtNum(data.totalTasksCancelled)}
          description={t("reports.companies.stats.cancelled")}
          accentColor="#2E75B6"
          icon={<CancelIcon />}
        />
        <StrategyCard
          title={fmtNum(data.totalTasksRejected)}
          description={t("reports.companies.stats.rejected")}
          accentColor="#EF4444"
          icon={<RejectedIcon />}
        />
      </div>

      {/* ── KPI rate cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 gap-4">
        {kpiRows.map((kpi) => (
          <StrategyCard
            key={kpi.key}
            title={kpi.value}
            description={t(`reports.companies.kpis.${kpi.key}`)}
            accentColor={kpi.color}
            icon={kpi.icon}
          />
        ))}
      </div>

      {/* ── KPI Summary Table ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#191C1E]">
            {t("reports.companies.tableTitle")}
          </h2>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ExportIcon />
            {t("reports.export")}
          </button>
        </div>

        {/* Mobile stacked list */}
        <div className="md:hidden flex flex-col divide-y divide-gray-100">
          {kpiRows.map((row) => (
            <div key={row.key} className="flex items-center justify-between px-5 py-4 gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {t(`reports.companies.kpis.${row.key}`)}
                </p>
                <p className="text-lg font-black text-[#2E75B6] mt-0.5">{row.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#2E75B6]">
                {[
                  t("reports.companies.columns.indicator"),
                  t("reports.companies.columns.currentValue"),
                ].map((h) => (
                  <th key={h} className="py-3.5 px-6 text-start text-white text-xs font-bold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {kpiRows.map((row, i) => (
                <tr key={row.key} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 1 ? "bg-[#F9FAFB]" : ""}`}>
                  <td className="py-4 px-6 text-start font-semibold text-gray-800 text-sm">
                    {t(`reports.companies.kpis.${row.key}`)}
                  </td>
                  <td className="py-4 px-6 text-start font-bold text-[#2E75B6] text-sm">
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ─── Live Tab ─────────────────────────────────────────────────────────────────

function LiveTab({ t }: { t: TFunction }) {
  const [data, setData] = useState<CompanyLive | null>(null);
  const [noData, setNoData] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setNoData(false);
    setError(null);
    getCompanyLive()
      .then((res) => {
        if (res === null) setNoData(true);
        else setData(res);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
        {t("reports.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-red-500">
        {error}
      </div>
    );
  }

  if (noData || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400">
        <LiveDotIcon />
        <p className="text-sm font-semibold">{t("reports.companies.live.noData")}</p>
      </div>
    );
  }

  const attendanceRate =
    data.capacityScheduled
      ? (data.capacityOnShiftOnline ?? 0) / data.capacityScheduled
      : null;

  const handleExport = () => {
    const rows = [
      { [t("reports.companies.columns.indicator")]: t("reports.companies.stats.completed"),              [t("reports.companies.columns.currentValue")]: fmtNum(data.tasksDelivered) },
      { [t("reports.companies.columns.indicator")]: t("reports.companies.live.tasksAccepted"),           [t("reports.companies.columns.currentValue")]: fmtNum(data.tasksAccepted) },
      { [t("reports.companies.columns.indicator")]: t("reports.companies.stats.rejected"),               [t("reports.companies.columns.currentValue")]: fmtNum(data.tasksRejected) },
      { [t("reports.companies.columns.indicator")]: t("reports.companies.live.totalRegistered"),         [t("reports.companies.columns.currentValue")]: fmtNum(data.capacityTotalRegistered) },
      { [t("reports.companies.columns.indicator")]: t("reports.companies.live.online"),                  [t("reports.companies.columns.currentValue")]: fmtNum(data.capacityOnline) },
      { [t("reports.companies.columns.indicator")]: t("reports.companies.live.scheduled"),               [t("reports.companies.columns.currentValue")]: fmtNum(data.capacityScheduled) },
      { [t("reports.companies.columns.indicator")]: t("reports.companies.live.onShiftOnline"),           [t("reports.companies.columns.currentValue")]: fmtNum(data.capacityOnShiftOnline) },
      { [t("reports.companies.columns.indicator")]: t("reports.companies.kpis.onTimeRate"),              [t("reports.companies.columns.currentValue")]: fmtPct(data.onTimeRate) },
      { [t("reports.companies.columns.indicator")]: t("reports.companies.kpis.cancellationRate"),        [t("reports.companies.columns.currentValue")]: fmtPct(data.cancellationRate) },
      { [t("reports.companies.columns.indicator")]: t("reports.companies.kpis.largeOrderOnTimeRate"),    [t("reports.companies.columns.currentValue")]: fmtPct(data.largeOrderOnTimeRate) },
      { [t("reports.companies.columns.indicator")]: t("reports.companies.kpis.avgShiftAttendanceRate"),  [t("reports.companies.columns.currentValue")]: fmtPct(attendanceRate) },
    ];
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t("reports.companies.tabs.live"));
    XLSX.writeFile(wb, `company-live-${data.snapshotDate}.xlsx`);
  };

  return (
    <>
      {/* ── Last updated / snapshot date ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
          <div className="flex items-center gap-2">
            <LiveDotIcon />
            <span>{t("reports.companies.live.lastUpdated")}:</span>
            <span className="font-semibold">{fmtRelativeTime(data.uploadedAt)}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            <span>{t("reports.companies.live.snapshotDate")}:</span>
            <span className="font-semibold">{data.snapshotDate}</span>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ExportIcon />
          {t("reports.export")}
        </button>
      </div>

      {/* ── Task counts ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StrategyCard
          title={fmtNum(data.tasksDelivered)}
          description={t("reports.companies.stats.completed")}
          accentColor="#27AE60"
          icon={<CompletedIcon />}
        />
        <StrategyCard
          title={fmtNum(data.tasksAccepted)}
          description={t("reports.companies.live.tasksAccepted")}
          accentColor="#2E75B6"
          icon={<ClockIcon />}
        />
        <StrategyCard
          title={fmtNum(data.tasksRejected)}
          description={t("reports.companies.stats.rejected")}
          accentColor="#EF4444"
          icon={<RejectedIcon />}
        />
      </div>

      {/* ── Capacity & rates ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StrategyCard
          title={fmtNum(data.capacityTotalRegistered)}
          description={t("reports.companies.live.totalRegistered")}
          accentColor="#6B7280"
          icon={<CourierIcon />}
        />
        <StrategyCard
          title={fmtNum(data.capacityOnline)}
          description={t("reports.companies.live.online")}
          accentColor="#2E75B6"
          icon={<CourierIcon />}
        />
        <StrategyCard
          title={fmtNum(data.capacityScheduled)}
          description={t("reports.companies.live.scheduled")}
          accentColor="#D97706"
          icon={<ShiftIcon />}
        />
        <StrategyCard
          title={fmtNum(data.capacityOnShiftOnline)}
          description={t("reports.companies.live.onShiftOnline")}
          accentColor="#7C3AED"
          icon={<CourierIcon />}
        />
      </div>

      {/* ── Rate KPIs ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StrategyCard
          title={fmtPct(data.onTimeRate)}
          description={t("reports.companies.kpis.onTimeRate")}
          accentColor="#27AE60"
          icon={<ClockIcon />}
        />
        <StrategyCard
          title={fmtPct(data.cancellationRate)}
          description={t("reports.companies.kpis.cancellationRate")}
          accentColor="#EF4444"
          icon={<CancelIcon />}
        />
        <StrategyCard
          title={fmtPct(data.largeOrderOnTimeRate)}
          description={t("reports.companies.kpis.largeOrderOnTimeRate")}
          accentColor="#9333EA"
          icon={<StarIcon />}
        />
        <StrategyCard
          title={fmtPct(attendanceRate)}
          description={t("reports.companies.kpis.avgShiftAttendanceRate")}
          accentColor="#D97706"
          icon={<ShiftIcon />}
        />
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type PageTab = "reports" | "live";

export default function CompaniesReportPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language?.startsWith("ar");
  const [activeTab, setActiveTab] = useState<PageTab>("reports");
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    getCompanySummary({ periodType: 1 }).catch((err) => {
      if (axios.isAxiosError(err) && err.response?.status === 403) {
        setForbidden(true);
      }
    });
  }, []);

  if (forbidden) return <ForbiddenPage onGoBack={() => navigate(-1)} dir={isRtl ? "rtl" : "ltr"} />;

  const tabs: { id: PageTab; label: string }[] = [
    { id: "reports", label: t("reports.companies.tabs.reports") },
    { id: "live",    label: t("reports.companies.tabs.live") },
  ];

  return (
    <div className="flex flex-col p-6 gap-5" dir={isRtl ? "rtl" : "ltr"}>

      {/* ── Title / subtitle ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#191C1E]">
            {t("reports.companies.title")}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            <span className="font-semibold text-gray-600">{t("reports.companies.subtitleBold")}</span>
            {" "}{t("reports.companies.subtitleRest")}
          </p>
        </div>
      </div>

      {/* ── Page tabs ── */}
      <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-1.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.id ? "bg-[#1D3478] text-white" : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab.id === "live" && <LiveDotIcon />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      {activeTab === "reports" ? <ReportsTab t={t} /> : <LiveTab t={t} />}
    </div>
  );
}
