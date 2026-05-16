import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import axios from "axios";
import "../lib/registerTranslations";
import "../index.css";
import StrategyCard from "../components/StrategyCard";
import { ForbiddenPage } from "@ops-brain/shared";
import { getCompanyOverview, PeriodFilter, CompanyOverviewResponse } from "../api/companies.service";

// ─── Icons ────────────────────────────────────────────────────────────────────

const CompletedIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 11 12 14 22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const ForwardedIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 10 20 15 15 20" />
    <path d="M4 4v7a4 4 0 0 0 4 4h12" />
  </svg>
);

const RejectedIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const ClockIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const CancelIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
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

const ExportIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// ─── Sample data ──────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  WithinTarget: { bg: "#E8F5EE", text: "#27AE60" },
  BelowTarget: { bg: "#FEF3C7", text: "#D97706" },
  ExceededLimit: { bg: "#FEE2E2", text: "#EF4444" },
};

const STATUS_VARIANTS: Record<string, "green" | "yellow" | "red"> = {
  WithinTarget: "green",
  BelowTarget: "yellow",
  ExceededLimit: "red",
};

function fmtVal(val: number | null, unit: string | null): string {
  if (val === null) return "—";
  return `${val}${unit || ""}`;
}

export default function CompaniesReportPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language?.startsWith("ar");
  const [period, setPeriod] = useState<PeriodFilter>("monthly");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<CompanyOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    setLoading(true);
    setForbidden(false);
    getCompanyOverview(period)
      .then(setData)
      .catch((err) => {
        if (axios.isAxiosError(err) && err.response?.status === 403) {
          setForbidden(true);
        } else {
          setError(err.message);
        }
      })
      .finally(() => setLoading(false));
  }, [period]);

  const periods: { id: PeriodFilter; label: string }[] = [
    { id: "daily",   label: t("reports.filter.daily") },
    { id: "weekly",  label: t("reports.filter.weekly") },
    { id: "monthly", label: t("reports.filter.monthly") },
  ];

  if (forbidden) return <ForbiddenPage onGoBack={() => navigate(-1)} dir={isRtl ? "rtl" : "ltr"} />;

  return (
    <div className="flex flex-col p-6 gap-5" dir={isRtl ? "rtl" : "ltr"}>

      {/* ── Row 1: title/subtitle (start) + create button (end) ── */}
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

      {/* ── Row 2: period tabs (start) + search (end) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Period tabs */}
        <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
          <button
            onClick={() => setPeriod("all")}
            className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${period === "all" ? "bg-[#D2A947] text-white" : "text-gray-500 hover:text-gray-800"}`}
          >
            {t("reports.filter.all")}
          </button>
          {periods.map((p) => (
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

        {/* Search Input */}
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t("reports.companies.searchPlaceholder")}
            dir={isRtl ? "rtl" : "ltr"}
            className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 w-52"
          />
        </div>
      </div>

      {/* ── Content Area ── */}
      {loading ? (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
          {t("reports.loading")}
        </div>
      ) : error ? (
        <div className="flex flex-1 items-center justify-center text-sm text-red-500">
          {error}
        </div>
      ) : data ? (
        <>
          {/* ── Top stats row: 3 cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StrategyCard
              title={String(data.orderStats.totalCompleted)}
              description={t("reports.companies.stats.completed")}
              accentColor="#27AE60"
              icon={<CompletedIcon />}
            />
            <StrategyCard
              title={String(data.orderStats.totalCancelled)}
              description={t("reports.companies.stats.forwarded")}
              accentColor="#2E75B6"
              icon={<ForwardedIcon />}
            />
            <StrategyCard
              title={String(data.orderStats.totalRejected)}
              description={t("reports.companies.stats.rejected")}
              accentColor="#EF4444"
              icon={<RejectedIcon />}
            />
          </div>

          {/* ── Bottom stats row: 5 KPI cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {data.kpis.map((kpi) => {
              const icons: Record<string, React.ReactNode> = {
                onTimeDeliveryRate: <ClockIcon />,
                cancellationRate: <CancelIcon />,
                rejectionRate: <RejectedIcon />,
                attendanceRate: <ShiftIcon />,
                operationalEfficiency: <EfficiencyIcon />
              };
              const colors: Record<string, string> = {
                onTimeDeliveryRate: "#2E75B6",
                cancellationRate: "#27AE60",
                rejectionRate: "#EF4444",
                attendanceRate: "#D97706",
                operationalEfficiency: "#7C3AED"
              };
              
              return (
                <StrategyCard
                  key={kpi.key}
                  title={fmtVal(kpi.value, kpi.unit)}
                  description={t(`reports.companies.kpis.${kpi.key}`)}
                  accentColor={colors[kpi.key] || "#9CA3AF"}
                  icon={icons[kpi.key]}
                  badge={kpi.value !== null ? {
                    label: t(`reports.companies.status.${kpi.status}`),
                    variant: STATUS_VARIANTS[kpi.status] || "gray"
                  } : undefined}
                />
              );
            })}
          </div>

          {/* ── KPI Summary Table ── */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-[#191C1E]">
                {t("reports.companies.tableTitle")}
              </h2>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => {
                    const exportData = data.kpis.map(k => ({
                      [t("reports.companies.columns.indicator")]: t(`reports.companies.kpis.${k.key}`),
                      [t("reports.companies.columns.currentValue")]: fmtVal(k.value, k.unit),
                      [t("reports.companies.columns.status")]: t(`reports.companies.status.${k.status}`)
                    }));
                    // Append total completed as a row
                    exportData.push({
                      [t("reports.companies.columns.indicator")]: t("reports.companies.stats.completed"),
                      [t("reports.companies.columns.currentValue")]: String(data.orderStats.totalCompleted),
                      [t("reports.companies.columns.status")]: ""
                    });
                    const ws = XLSX.utils.json_to_sheet(exportData);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, t("reports.companies.title"));
                    XLSX.writeFile(wb, "company-report.xlsx");
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <ExportIcon />
                  {t("reports.export")}
                </button>
              </div>
            </div>

            {/* ── Mobile stacked list (< md) ── */}
            {(() => {
              const filteredKpis = data.kpis.filter(
                (kpi) => !search || t(`reports.companies.kpis.${kpi.key}`).toLowerCase().includes(search.toLowerCase())
              );
              return (
                <>
                  <div className="md:hidden flex flex-col divide-y divide-gray-100">
                    {filteredKpis.map((row) => {
                      const statusStyle = STATUS_STYLES[row.status] ?? null;
                      return (
                        <div key={row.key} className="flex items-center justify-between px-5 py-4 gap-4">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-gray-800 truncate">
                              {t(`reports.companies.kpis.${row.key}`)}
                            </p>
                            <p className="text-lg font-black text-[#2E75B6] mt-0.5">
                              {fmtVal(row.value, row.unit)}
                            </p>
                          </div>
                          <div className="shrink-0">
                            {row.value !== null && statusStyle ? (
                              <span
                                className="text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
                                style={{ background: statusStyle.bg, color: statusStyle.text }}
                              >
                                {t(`reports.companies.status.${row.status}`)}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400 font-medium">
                                {t("reports.companies.noDataStatus", "No Data")}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Desktop table (≥ md) ── */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-[#2E75B6]">
                          {[
                            t("reports.companies.columns.indicator"),
                            t("reports.companies.columns.currentValue"),
                            t("reports.companies.columns.status"),
                          ].map((h) => (
                            <th key={h} className="py-3.5 px-6 text-start text-white text-xs font-bold">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredKpis.map((row, i) => {
                          const statusStyle = STATUS_STYLES[row.status] ?? null;
                          return (
                            <tr key={row.key} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${i % 2 === 1 ? "bg-[#F9FAFB]" : ""}`}>
                              <td className="py-4 px-6 text-start font-semibold text-gray-800 text-sm">
                                {t(`reports.companies.kpis.${row.key}`)}
                              </td>
                              <td className="py-4 px-6 text-start font-bold text-[#2E75B6] text-sm">
                                {fmtVal(row.value, row.unit)}
                              </td>
                              <td className="py-4 px-6 text-start">
                                {row.value !== null && statusStyle ? (
                                  <span
                                    className="text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap"
                                    style={{ background: statusStyle.bg, color: statusStyle.text }}
                                  >
                                    {t(`reports.companies.status.${row.status}`)}
                                  </span>
                                ) : (
                                  <span className="text-xs text-gray-400 font-medium font-cairo">
                                    {t("reports.companies.noDataStatus", "No Data")}
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
          </div>
        </>
      ) : (
        <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
          {t("reports.noData")}
        </div>
      )}
    </div>
  );
}
