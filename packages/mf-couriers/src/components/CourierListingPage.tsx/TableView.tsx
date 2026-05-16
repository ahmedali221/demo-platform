import React from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { CourierListItem } from "../../types/Couriers";

const RISK_LABEL: Record<number, { ar: string; en: string; cls: string }> = {
  1: { ar: "آمن", en: "Safe", cls: "bg-emerald-100 text-emerald-700" },
  2: { ar: "يحتاج متابعة", en: "Follow up", cls: "bg-amber-100 text-amber-700" },
  3: { ar: "خطر مرتفع", en: "High risk", cls: "bg-red-100 text-red-700" },
};

const ESCALATION_LABEL: Record<number, { ar: string; en: string; cls: string }> = {
  1: { ar: "إنذار", en: "Warning", cls: "bg-yellow-100 text-yellow-700" },
  2: { ar: "تدريب", en: "Training", cls: "bg-blue-100 text-blue-700" },
  3: { ar: "إيقاف 3س", en: "3h Suspend", cls: "bg-orange-100 text-orange-700" },
  4: { ar: "إيقاف يوم", en: "1d Suspend", cls: "bg-red-100 text-red-700" },
  5: { ar: "إيقاف ممتد", en: "Ext. Suspend", cls: "bg-red-200 text-red-900" },
};

export function ActionButton({ onClick }: { onClick: () => void }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  return (
    <button
      onClick={onClick}
      type="button"
      className="inline-flex min-w-[96px] cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-blue-700 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
    >
      {isRtl ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
      <span>{t("courier.show")}</span>
    </button>
  );
}

function AgentCell({ courier }: { courier: CourierListItem }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-600">
        {courier.courierName?.[0]?.toUpperCase() ?? "?"}
      </div>
      <div className="text-start">
        <div className="text-[15px] font-bold text-slate-900 sm:text-sm">
          {courier.courierName}
        </div>
        <div className="mt-0.5 text-sm font-medium tracking-wide text-slate-400">
          {courier.externalId ?? "—"}
        </div>
      </div>
    </div>
  );
}

function LiveStatusCell({ currentlyOnline, onShift }: { currentlyOnline: boolean | null; onShift: boolean | null }) {
  const { t } = useTranslation();
  if (currentlyOnline === null) {
    return <span className="text-slate-400 text-sm">—</span>;
  }
  const isOnline = currentlyOnline;
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500" : "bg-red-500"}`} />
      <span className={`text-sm font-medium ${isOnline ? "text-emerald-700" : "text-red-600"}`}>
        {isOnline
          ? t("courier.activeNow")
          : t("courier.inactive", { defaultValue: "غير نشط" })}
      </span>
      {onShift === true && (
        <span className="text-xs text-slate-400">
          {t("courier.onShift", { defaultValue: "في الوردية" })}
        </span>
      )}
    </div>
  );
}

function KeetaLevelBadge({ level }: { level: string | null }) {
  if (!level || level === "null") return <span className="text-slate-400">—</span>;
  if (level === "-") return <span className="text-slate-400 text-sm">—</span>;
  return (
    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-sm font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
      {level}
    </span>
  );
}

function EscalationBadge({ level }: { level: number | null }) {
  const { i18n } = useTranslation();
  if (level == null || level === 0) return <span className="text-slate-400">—</span>;
  const entry = ESCALATION_LABEL[level];
  if (!entry) return <span className="text-slate-400">—</span>;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${entry.cls}`}>
      {i18n.language === "ar" ? entry.ar : entry.en}
    </span>
  );
}

export default function TableView({ couriers }: { couriers: CourierListItem[] }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const dir = i18n.language === "ar" ? "rtl" : "ltr";
  const lang = i18n.language as "ar" | "en";

  return (
    <div dir={dir} className="min-h-screen bg-slate-100">
      <div className="mx-auto overflow-hidden rounded-t-[28px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.08)]">
        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-full">
            <thead>
              <tr className="bg-[#c8d8ea] text-slate-950">
                <th className="px-6 py-6 text-start text-sm font-extrabold">{t("courier.courier")}</th>
                <th className="px-4 py-6 text-start text-sm font-extrabold">{t("courier.platform")}</th>
                <th className="px-4 py-6 text-start text-sm font-extrabold">{t("courier.dangerLevel")}</th>
                <th className="px-4 py-6 text-start text-sm font-extrabold">{t("courier.liveStatus", { defaultValue: "الحالة المباشرة" })}</th>
                <th className="px-4 py-6 text-start text-sm font-extrabold">{t("courier.orders")}</th>
                <th className="px-4 py-6 text-start text-sm font-extrabold">{t("courier.performance")}</th>
                <th className="px-4 py-6 text-start text-sm font-extrabold">{t("courier.class")}</th>
                <th className="px-4 py-6 text-start text-sm font-extrabold">{t("courier.violations")}</th>
                <th className="px-4 py-6 text-start text-sm font-extrabold">{t("courier.lastAction")}</th>
                <th className="px-6 py-6 text-start text-sm font-extrabold"></th>
              </tr>
            </thead>
            <tbody>
              {couriers.map((courier) => {
                const risk = RISK_LABEL[courier.riskLevel];
                return (
                  <tr key={courier.courierId} className="border-b border-slate-200 bg-white hover:bg-slate-50/80">
                    <td className="px-6 py-4 align-middle">
                      <AgentCell courier={courier} />
                    </td>
                    <td className="px-4 py-4 text-start text-sm font-bold text-slate-900">
                      {courier.providerName ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-start">
                      {risk ? (
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${risk.cls}`}>
                          {lang === "ar" ? risk.ar : risk.en}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-4 text-start">
                      <LiveStatusCell currentlyOnline={courier.currentlyOnline} onShift={courier.onShift} />
                    </td>
                    <td className="px-4 py-4 text-start text-sm font-medium text-slate-900">
                      {courier.totalTasksDelivered ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-start text-sm font-medium text-slate-900">
                      {courier.performanceScore.toFixed(1)}
                    </td>
                    <td className="px-4 py-4 text-start">
                      <KeetaLevelBadge level={courier.keetaLevel} />
                    </td>
                    <td className="px-4 py-4 text-start text-sm font-semibold text-slate-900">
                      {courier.violationCount30d}
                    </td>
                    <td className="px-4 py-4 text-start">
                      <EscalationBadge level={courier.latestEscalationAction} />
                    </td>
                    <td className="px-6 py-4">
                      <ActionButton onClick={() => navigate(`/couriers/${courier.courierId}`)} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="space-y-4 p-4 lg:hidden">
          {couriers.map((courier) => {
            const risk = RISK_LABEL[courier.riskLevel];
            return (
              <div key={courier.courierId} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <AgentCell courier={courier} />
                  {risk && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${risk.cls}`}>
                      {lang === "ar" ? risk.ar : risk.en}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-500">
                  <span>{courier.providerName ?? "—"}</span>
                  <span>•</span>
                  <span>{t("courier.performance")}: {courier.performanceScore.toFixed(1)}</span>
                  <span>•</span>
                  <span>{t("courier.violations")}: {courier.violationCount30d}</span>
                </div>
                <div className="mt-3">
                  <LiveStatusCell currentlyOnline={courier.currentlyOnline} onShift={courier.onShift} />
                </div>
                <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <ActionButton onClick={() => navigate(`/couriers/${courier.courierId}`)} />
                  <EscalationBadge level={courier.latestEscalationAction} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
