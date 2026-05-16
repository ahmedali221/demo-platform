import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import axios from "axios";
import "../lib/registerTranslations";
import "../index.css";
import StrategyCard from "../components/StrategyCard";
import { ForbiddenPage } from "@ops-brain/shared";
import {
  getCourierPerformance,
  CourierPerformanceItem,
  CourierPerformanceSummary,
  PeriodType,
} from "../api/couriers.service";

// ─── Icons ────────────────────────────────────────────────────────────────────

const UsersIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const CheckIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const AlertIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86 1.82 18h20.36L10.29 3.86z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const PercentIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="5" x2="5" y2="19" />
    <circle cx="6.5" cy="6.5" r="2.5" />
    <circle cx="17.5" cy="17.5" r="2.5" />
  </svg>
);

const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

// ─── Colour maps ──────────────────────────────────────────────────────────────

const KEETA_LEVEL_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  A: { bg: "#E8F5EE", text: "#27AE60", border: "#27AE60" },
  B: { bg: "#EBF0FA", text: "#2E75B6", border: "#2E75B6" },
  C: { bg: "#FEF3C7", text: "#D97706", border: "#D97706" },
  D: { bg: "#FEE2E2", text: "#EF4444", border: "#EF4444" },
};

const VALIDITY_TIER_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: "#E8F5EE", text: "#27AE60", border: "#27AE60" },
  2: { bg: "#EBF0FA", text: "#2E75B6", border: "#2E75B6" },
  3: { bg: "#FEF3C7", text: "#D97706", border: "#D97706" },
  4: { bg: "#FEE2E2", text: "#EF4444", border: "#EF4444" },
  5: { bg: "#F3F4F6", text: "#6B7280", border: "#D1D5DB" },
};

const VALIDITY_TIER_LABEL: Record<number, string> = { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPct(v: number | null): string {
  if (v === null || v === undefined) return "—";
  return `${(v * 100).toFixed(1)}%`;
}

function fmtInt(v: number | null): string {
  if (v === null || v === undefined) return "—";
  return String(v);
}

function KeetaBadge({ level }: { level: string | null }) {
  if (!level) return <span className="text-xs text-gray-400">—</span>;
  const style = KEETA_LEVEL_COLORS[level];
  if (!style) return <span className="text-xs text-gray-500">{level}</span>;
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-black"
      style={{ background: style.bg, color: style.text }}
    >
      {level}
    </span>
  );
}

function TierBadge({ tier }: { tier: number }) {
  const style = VALIDITY_TIER_COLORS[tier] ?? { bg: "#F3F4F6", text: "#6B7280" };
  const label = VALIDITY_TIER_LABEL[tier] ?? String(tier);
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-black"
      style={{ background: style.bg, color: style.text }}
    >
      {label}
    </span>
  );
}

function ValidityBadge({ isValid }: { isValid: boolean }) {
  return isValid ? (
    <span className="text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap bg-[#E8F5EE] text-[#27AE60]">
      صالح ✓
    </span>
  ) : (
    <span className="text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap bg-[#FEE2E2] text-[#EF4444]">
      غير صالح ✗
    </span>
  );
}

// ─── Courier Card (grid view) ─────────────────────────────────────────────────

function CourierCard({ courier }: { courier: CourierPerformanceItem }) {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-[#191C1E] truncate">{courier.courierName}</p>
          <p className="text-xs text-gray-400 mt-0.5">{courier.providerName ?? "—"}</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <KeetaBadge level={courier.keetaLevel} />
          <TierBadge tier={courier.validityTier} />
          <ValidityBadge isValid={courier.isValid} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { label: t("reports.couriers.columns.totalTasksDelivered"),          value: fmtInt(courier.totalTasksDelivered) },
          { label: t("reports.couriers.columns.onTimeRate"),                   value: fmtPct(courier.onTimeRate) },
          { label: t("reports.couriers.columns.avgCompletionRate"),            value: fmtPct(courier.avgCompletionRate) },
          { label: t("reports.couriers.columns.totalTasksCancelledByCourier"), value: fmtInt(courier.totalTasksCancelledByCourier) },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5 bg-gray-50 rounded-xl p-2.5">
            <span className="text-gray-400">{label}</span>
            <span className="font-semibold text-gray-700">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Pagination bar ───────────────────────────────────────────────────────────

function PaginationBar({
  page, totalPages, total, pageSize, isRtl, onPageChange,
}: {
  page: number; totalPages: number; total: number;
  pageSize: number; isRtl: boolean;
  onPageChange: (p: number) => void;
}) {
  const dir = isRtl ? "rtl" : "ltr";
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const visiblePages = () => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (page > 3) pages.push("…");
    for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) pages.push(p);
    if (page < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100" dir={dir}>
      <span className="text-xs text-gray-500">{from}–{to} / {total}</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {isRtl ? "›" : "‹"}
        </button>
        {visiblePages().map((p, idx) =>
          p === "…" ? (
            <span key={`ellipsis-${idx}`} className="w-8 h-8 flex items-center justify-center text-xs text-gray-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p as number)}
              className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-colors ${
                p === page ? "bg-[#1D3478] text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {isRtl ? "‹" : "›"}
        </button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const PAGE_SIZE_LIST = 20;
const PAGE_SIZE_GRID = 12;

type ViewMode = "grid" | "list";

type PeriodTab = "all" | "daily" | "weekly" | "monthly";

const PERIOD_TAB_TO_TYPE: Record<PeriodTab, PeriodType | null> = {
  all:     null,
  daily:   1,
  weekly:  2,
  monthly: 3,
};

const EMPTY_SUMMARY: CourierPerformanceSummary = {
  totalCouriers: 0, validCount: 0, invalidCount: 0, validityRate: 0,
  gradeA: 0, gradeB: 0, gradeC: 0, gradeD: 0, noLevel: 0,
};

export default function CouriersReportPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === "ar";
  const dir = isRtl ? "rtl" : "ltr";

  const [periodTab, setPeriodTab] = useState<PeriodTab>("all");
  const [view, setView] = useState<ViewMode>("list");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const [items, setItems]     = useState<CourierPerformanceItem[]>([]);
  const [summary, setSummary] = useState<CourierPerformanceSummary>(EMPTY_SUMMARY);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const pageSize = view === "grid" ? PAGE_SIZE_GRID : PAGE_SIZE_LIST;

  // Debounce search — reset to page 1 on new search
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSearchChange = (value: string) => {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 400);
  };

  useEffect(() => {
    setLoading(true);
    setError(null);
    setForbidden(false);

    getCourierPerformance({
      periodType: PERIOD_TAB_TO_TYPE[periodTab],
      search: debouncedSearch || null,
      page,
      pageSize,
    })
      .then((data) => {
        setItems(data.items);
        setSummary(data.summary);
        setTotalCount(data.totalCount);
      })
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          setForbidden(true);
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [periodTab, debouncedSearch, page, pageSize]);

  // Reset page when period or view changes
  const handlePeriodChange = (tab: PeriodTab) => { setPeriodTab(tab); setPage(1); };
  const handleViewChange = (v: ViewMode) => { setView(v); setPage(1); };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const validityRatePct = (summary.validityRate * 100).toFixed(1);

  const levelCards = [
    { level: "A", count: summary.gradeA,  ...KEETA_LEVEL_COLORS.A },
    { level: "B", count: summary.gradeB,  ...KEETA_LEVEL_COLORS.B },
    { level: "C", count: summary.gradeC,  ...KEETA_LEVEL_COLORS.C },
    { level: "D", count: summary.gradeD,  ...KEETA_LEVEL_COLORS.D },
  ];

  const tableColumns: { header: string; key: keyof CourierPerformanceItem }[] = [
    { header: t("reports.couriers.columns.courierName"),                  key: "courierName" },
    { header: t("reports.couriers.columns.providerName"),                 key: "providerName" },
    { header: t("reports.couriers.columns.totalTasksDelivered"),          key: "totalTasksDelivered" },
    { header: t("reports.couriers.columns.totalTasksCancelledByCourier"), key: "totalTasksCancelledByCourier" },
    { header: t("reports.couriers.columns.totalTasksRejected"),           key: "totalTasksRejected" },
    { header: t("reports.couriers.columns.onTimeRate"),                   key: "onTimeRate" },
    { header: t("reports.couriers.columns.avgCompletionRate"),            key: "avgCompletionRate" },
    { header: t("reports.couriers.columns.keetaLevel"),                   key: "keetaLevel" },
    { header: t("reports.couriers.columns.validityTier"),                 key: "validityTier" },
    { header: t("reports.couriers.columns.isValid"),                      key: "isValid" },
  ];

  const handleExport = () => {
    const data = items.map((row) => ({
      [t("reports.couriers.columns.courierName")]:                  row.courierName,
      [t("reports.couriers.columns.providerName")]:                 row.providerName ?? "—",
      [t("reports.couriers.columns.totalTasksDelivered")]:          fmtInt(row.totalTasksDelivered),
      [t("reports.couriers.columns.totalTasksCancelledByCourier")]: fmtInt(row.totalTasksCancelledByCourier),
      [t("reports.couriers.columns.totalTasksRejected")]:           fmtInt(row.totalTasksRejected),
      [t("reports.couriers.columns.onTimeRate")]:                   fmtPct(row.onTimeRate),
      [t("reports.couriers.columns.avgCompletionRate")]:            fmtPct(row.avgCompletionRate),
      [t("reports.couriers.columns.keetaLevel")]:                   row.keetaLevel ?? "—",
      [t("reports.couriers.columns.validityTier")]:                 VALIDITY_TIER_LABEL[row.validityTier] ?? String(row.validityTier),
      [t("reports.couriers.columns.isValid")]:                      row.isValid ? "صالح" : "غير صالح",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t("reports.couriers.title"));
    XLSX.writeFile(wb, "couriers-performance.xlsx");
  };

  if (forbidden) return <ForbiddenPage onGoBack={() => navigate(-1)} dir={dir as "rtl" | "ltr"} />;

  return (
    <div className="flex flex-col min-h-full p-6 gap-5" dir={dir}>

      {/* ── Row 1: title ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#191C1E]">
            {t("reports.couriers.title")}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            <span className="font-semibold text-gray-600">{t("reports.couriers.subtitleBold")}</span>
            {" "}{t("reports.couriers.subtitleRest")}
          </p>
        </div>
      </div>

      {/* ── Row 2: view toggle + period tabs + search ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* View toggle */}
        <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm gap-1">
          <button
            onClick={() => handleViewChange("grid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${view === "grid" ? "bg-[#1D3478] text-white" : "text-gray-500 hover:text-gray-800"}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
            {t("reports.view.grid")}
          </button>
          <button
            onClick={() => handleViewChange("list")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${view === "list" ? "bg-[#1D3478] text-white" : "text-gray-500 hover:text-gray-800"}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            {t("reports.view.list")}
          </button>
        </div>

        {/* Period tabs + search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            {(["all", "daily", "weekly", "monthly"] as PeriodTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => handlePeriodChange(tab)}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  periodTab === tab ? "bg-[#1D3478] text-white" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t(`reports.filter.${tab}`)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <SearchIcon />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={t("reports.couriers.searchPlaceholder")}
              dir={dir}
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-52"
            />
          </div>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StrategyCard
          title={String(summary.totalCouriers)}
          description={t("reports.couriers.stats.total")}
          accentColor="#2E75B6"
          icon={<UsersIcon />}
        />
        <StrategyCard
          title={String(summary.validCount)}
          description={t("reports.couriers.stats.eligible")}
          accentColor="#27AE60"
          icon={<CheckIcon />}
          badge={{ label: t("reports.couriers.stats.eligibleBadge"), variant: "green" }}
        />
        <StrategyCard
          title={String(summary.invalidCount)}
          description={t("reports.couriers.stats.ineligible")}
          accentColor="#EF4444"
          icon={<AlertIcon />}
          badge={{ label: t("reports.couriers.stats.ineligibleBadge"), variant: "red" }}
        />
        <StrategyCard
          title={`${validityRatePct}%`}
          description={t("reports.couriers.stats.eligibilityRate")}
          accentColor="#D2A947"
          icon={<PercentIcon />}
          badge={{ label: t("reports.couriers.stats.rateBadge"), variant: "yellow" }}
        />
      </div>

      {/* ── Keeta level distribution ── */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <p className="text-sm font-bold text-gray-500 mb-4 text-start">
          {t("reports.couriers.classificationTable")}
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {levelCards.map(({ level, count, bg, text, border }) => (
            <div
              key={level}
              className="flex flex-col items-center justify-center p-5 rounded-2xl gap-2"
              style={{ background: bg, border: `2px solid ${border}` }}
            >
              <span className="text-3xl font-black" style={{ color: text }}>{level}</span>
              <span className="text-lg font-black" style={{ color: text }}>{count}</span>
              <span className="text-xs font-semibold text-gray-500">{t("reports.couriers.couriersUnit")}</span>
            </div>
          ))}
          {/* No level card */}
          <div className="flex flex-col items-center justify-center p-5 rounded-2xl gap-2 bg-gray-50" style={{ border: "2px solid #D1D5DB" }}>
            <span className="text-3xl font-black text-gray-400">—</span>
            <span className="text-lg font-black text-gray-400">{summary.noLevel}</span>
            <span className="text-xs font-semibold text-gray-500">{t("reports.couriers.noLevel")}</span>
          </div>
        </div>
      </div>

      {/* ── Data section (grid or list) ── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Section header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#191C1E]">
            {t("reports.couriers.tableTitle")}
          </h2>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <ExportIcon />
            {t("reports.export")}
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            {t("reports.loading")}
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-16 text-sm text-red-500">
            {error}
          </div>
        ) : items.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            {t("reports.noData")}
          </div>
        ) : view === "grid" ? (
          <>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((courier) => (
                <CourierCard key={courier.courierId} courier={courier} />
              ))}
            </div>
            {totalPages > 1 && (
              <PaginationBar
                page={page}
                totalPages={totalPages}
                total={totalCount}
                pageSize={pageSize}
                isRtl={isRtl}
                onPageChange={setPage}
              />
            )}
          </>
        ) : (
          <>
            {/* ── Mobile cards (< md) ── */}
            <div className="md:hidden flex flex-col divide-y divide-gray-100">
              {items.map((row) => (
                <div key={row.courierId} className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-sm text-[#191C1E]">{row.courierName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{row.providerName ?? "—"}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <KeetaBadge level={row.keetaLevel} />
                      <TierBadge tier={row.validityTier} />
                      <ValidityBadge isValid={row.isValid} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    {[
                      { label: t("reports.couriers.columns.totalTasksDelivered"),          value: fmtInt(row.totalTasksDelivered) },
                      { label: t("reports.couriers.columns.totalTasksCancelledByCourier"), value: fmtInt(row.totalTasksCancelledByCourier) },
                      { label: t("reports.couriers.columns.totalTasksRejected"),           value: fmtInt(row.totalTasksRejected) },
                      { label: t("reports.couriers.columns.onTimeRate"),                   value: fmtPct(row.onTimeRate) },
                      { label: t("reports.couriers.columns.avgCompletionRate"),            value: fmtPct(row.avgCompletionRate) },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex flex-col gap-0.5">
                        <span className="text-gray-400">{label}</span>
                        <span className="font-semibold text-gray-700">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Desktop table (≥ md) ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm" dir={dir}>
                <thead>
                  <tr className="bg-[#2E75B6]">
                    {tableColumns.map((col) => (
                      <th
                        key={col.key}
                        className="py-3.5 px-4 text-start text-white text-xs font-bold whitespace-nowrap"
                      >
                        {col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((row, i) => (
                    <tr
                      key={row.courierId}
                      className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 1 ? "bg-[#F9FAFB]" : ""}`}
                    >
                      {tableColumns.map(({ key }) => {
                        if (key === "keetaLevel") {
                          return (
                            <td key={key} className="py-3.5 px-4 text-start">
                              <KeetaBadge level={row.keetaLevel} />
                            </td>
                          );
                        }
                        if (key === "validityTier") {
                          return (
                            <td key={key} className="py-3.5 px-4 text-start">
                              <TierBadge tier={row.validityTier} />
                            </td>
                          );
                        }
                        if (key === "isValid") {
                          return (
                            <td key={key} className="py-3.5 px-4 text-start">
                              <ValidityBadge isValid={row.isValid} />
                            </td>
                          );
                        }
                        if (key === "onTimeRate" || key === "avgCompletionRate") {
                          return (
                            <td key={key} className="py-3.5 px-4 text-start text-xs text-gray-700 whitespace-nowrap">
                              {fmtPct(row[key] as number | null)}
                            </td>
                          );
                        }
                        const val = row[key];
                        return (
                          <td key={key} className="py-3.5 px-4 text-start text-xs text-gray-700 whitespace-nowrap">
                            {val === null || val === undefined ? "—" : String(val)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <PaginationBar
                page={page}
                totalPages={totalPages}
                total={totalCount}
                pageSize={pageSize}
                isRtl={isRtl}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
