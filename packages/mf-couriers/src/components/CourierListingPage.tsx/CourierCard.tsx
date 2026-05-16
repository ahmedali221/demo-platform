import { useTranslation } from "react-i18next";
import Warning from "../../assets/warning.svg";
import tick from "../../assets/tick.svg";
import arrow from "../../assets/arrow.svg";
import i18n from "../../lib/i18n";
import InfoCard from "./InfoCard";
import type { CourierListItem } from "../../types/Couriers";
import { useNavigate } from "react-router-dom";

const RiskColorScheme = {
  1: { bg: "#27AE6040", text: "#006733" }, // Green — آمن
  2: { bg: "#F9731633", text: "#F97316" }, // Yellow — يحتاج متابعة
  3: { bg: "#C0392B33", text: "#C0392B" }, // Red — خطر مرتفع
} as const;

function riskLabel(level: 1 | 2 | 3, t: (k: string) => string) {
  if (level === 1) return t("courier.safe");
  if (level === 2) return t("courier.warning");
  return t("courier.highDanger");
}

function LiveStatusBadge({ currentlyOnline, onShift }: { currentlyOnline: boolean | null; onShift: boolean | null }) {
  const { t } = useTranslation();
  if (currentlyOnline === null) {
    return (
      <span className="text-xs text-gray-400 px-2 py-0.5 rounded-full bg-gray-100">
        {t("courier.noLiveData", { defaultValue: "لا توجد بيانات مباشرة" })}
      </span>
    );
  }
  const color = currentlyOnline ? "text-emerald-700 bg-emerald-50" : "text-red-600 bg-red-50";
  let label = currentlyOnline ? t("courier.activeNow") : t("courier.inactive", { defaultValue: "غير نشط" });
  if (onShift === true) label += ` — ${t("courier.onShift", { defaultValue: "في الوردية" })}`;
  if (currentlyOnline && onShift === false) label += ` — ${t("courier.offShift", { defaultValue: "خارج الوردية" })}`;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>
      {label}
    </span>
  );
}

function EscalationBadge({ level }: { level: number | null }) {
  const { t } = useTranslation();
  if (level == null || level === 0) return null;
  const map: Record<number, { label: string; cls: string }> = {
    1: { label: t("courier.escalation.warning", { defaultValue: "إنذار" }), cls: "bg-yellow-100 text-yellow-700" },
    2: { label: t("courier.escalation.training", { defaultValue: "تدريب" }), cls: "bg-blue-100 text-blue-700" },
    3: { label: t("courier.escalation.suspend3h", { defaultValue: "إيقاف 3 ساعات" }), cls: "bg-orange-100 text-orange-700" },
    4: { label: t("courier.escalation.suspend1d", { defaultValue: "إيقاف يوم" }), cls: "bg-red-100 text-red-700" },
    5: { label: t("courier.escalation.suspendExt", { defaultValue: "إيقاف ممتد" }), cls: "bg-red-200 text-red-900" },
  };
  const entry = map[level];
  if (!entry) return null;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${entry.cls}`}>
      {entry.label}
    </span>
  );
}

const CourierCard = ({ courier }: { courier: CourierListItem }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language;
  const color = RiskColorScheme[courier.riskLevel] ?? RiskColorScheme[1];
  const nameInitial = courier.courierName?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="rounded-2xl flex flex-col gap-4 border border-[#d8d8d8] bg-white shadow-md overflow-hidden">
      <div className="flex flex-col gap-6 p-6">
        <div className="flex justify-between">
          <div className="flex gap-4">
            <div
              className="h-14 w-14 flex items-center justify-center rounded-2xl text-xl font-bold"
              style={{ background: color.bg, color: color.text }}
            >
              {nameInitial}
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-bold text-lg text-[#191C1E]">
                {courier.courierName}
              </span>
              <div className="text-sm">
                <span className="text-[#94A3B8]">{courier.externalId ?? "—"}</span>
                <span className="text-[#94A3B8]"> • </span>
                <span className="text-[#E67E22]">{courier.providerName ?? "—"}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <span
              style={{ background: color.bg, color: color.text }}
              className="text-sm text-center font-medium px-4 py-0.5 rounded-full"
            >
              {riskLabel(courier.riskLevel, t)}
            </span>
            <LiveStatusBadge currentlyOnline={courier.currentlyOnline} onShift={courier.onShift} />
          </div>
        </div>

        <div className="flex gap-2 justify-between">
          <InfoCard
            title={t("courier.orders")}
            value={courier.totalTasksDelivered ?? "—"}
          />
          <InfoCard
            title={t("courier.class")}
            value={courier.keetaLevel === "-" ? "—" : (courier.keetaLevel ?? "—")}
            color={color.text}
          />
        </div>

        <div className="space-y-2">
          <div className="w-full flex justify-between">
            <span className="text-[#94A3B8] text-sm font-bold">
              {t("courier.performance")}
            </span>
            <span className="font-bold" style={{ color: color.text }}>
              {courier.performanceScore.toFixed(1)}
            </span>
          </div>
          <div className="bg-[#ECEEF0] w-full h-1.5 rounded-full">
            <div
              className="h-1.5 rounded-full"
              style={{
                width: `${Math.min(courier.performanceScore, 100)}%`,
                background: color.text,
              }}
            />
          </div>
        </div>
      </div>

      <div className="bg-[#F2F4F6] border-t border-[#d8d8d8] p-6 flex justify-between items-center">
        <div className="flex items-center gap-1">
          {courier.violationCount30d === 0 ? (
            <>
              <img src={tick} alt="" />
              <span className="text-sm font-bold">{t("courier.noViolations")}</span>
            </>
          ) : (
            <>
              <img src={Warning} alt="" />
              <span className="text-sm font-bold">
                {courier.violationCount30d} {t("courier.violation")}
              </span>
            </>
          )}
        </div>
        <EscalationBadge level={courier.latestEscalationAction} />
        <button
          onClick={() => navigate(`/couriers/${courier.courierId}`)}
          className="text-[#191C1E] border flex gap-1 items-center border-brand rounded-xl font-bold p-2 text-sm cursor-pointer"
        >
          {t("courier.viewFile")}
          <img
            src={arrow}
            alt=""
            className={`${lang === "en" ? "rotate-180" : ""}`}
          />
        </button>
      </div>
    </div>
  );
};

export default CourierCard;
