import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getAutoAlerts, AutoAlertDto } from "../api/dashboard.service";

type AlertSeverity = "danger" | "warning";

const severityStyles: Record<AlertSeverity, {
  rowBg: string;
  border: string;
  badgeBg: string;
  badgeOutline: string;
  badgeText: string;
  label: string;
}> = {
  danger: {
    rowBg:        "bg-red-500/20",
    border:       "border-red-700",
    badgeBg:      "bg-red-500/25",
    badgeOutline: "outline-red-700",
    badgeText:    "text-red-700",
    label:        "alerts.danger",
  },
  warning: {
    rowBg:        "bg-orange-500/20",
    border:       "border-orange-500",
    badgeBg:      "bg-orange-500/25",
    badgeOutline: "outline-orange-500",
    badgeText:    "text-orange-500",
    label:        "alerts.warning",
  },
};

function useAlertMessage(alert: AutoAlertDto) {
  const { t } = useTranslation();
  switch (alert.type) {
    case "OnTimeDelivery":
    case "RejectionRate":
    case "ShiftAttendance":
      return t(`alerts.types.${alert.type}`, {
        current: alert.currentValue,
        threshold: alert.threshold,
      });
    case "ShiftPeriodExceeded":
      return t("alerts.types.ShiftPeriodExceeded", { shiftName: alert.shiftName });
    case "ExpiringDocuments":
      return t("alerts.types.ExpiringDocuments", { count: alert.count });
    default:
      return alert.type;
  }
}

function AlertRow({ alert }: { alert: AutoAlertDto }) {
  const { t } = useTranslation();
  const severity: AlertSeverity = alert.severity === "Danger" ? "danger" : "warning";
  const s = severityStyles[severity];
  const message = useAlertMessage(alert);

  return (
    <div className={`w-full h-14 ${s.rowBg} rounded-lg border-r-4 ${s.border} flex justify-center items-center gap-3.5`}>
      <div className="flex-1 px-3 inline-flex flex-col justify-center items-end gap-1.5">
        <div className="self-stretch inline-flex justify-between items-start">
          <span className="text-right text-black text-[10px] font-bold font-cairo leading-4">{message}</span>
          <div className={`px-2 py-[3px] ${s.badgeBg} rounded-full outline outline-1 outline-offset-[-1px] ${s.badgeOutline} flex justify-center items-center`}>
            <span className={`${s.badgeText} text-[10px] font-bold font-cairo`}>{t(s.label)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AutoAlertsCard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const [alerts, setAlerts] = useState<AutoAlertDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAutoAlerts()
      .then(setAlerts)
      .catch(() => setAlerts([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="w-full p-4 bg-white rounded-2xl flex flex-col gap-6 shadow-sm border border-neutral-100"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-black text-xl font-bold leading-7">{t("alerts.title")}</span>
          <div className="w-8 h-8 bg-white rounded-lg shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05)] outline outline-[1.5px] outline-offset-[-1.5px] outline-neutral-200 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="#65a30d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className="px-2 py-[3px] bg-lime-600/25 rounded-full outline outline-1 outline-offset-[-1px] outline-lime-600 flex items-center justify-center">
          <span className="text-lime-600 text-[10px] font-bold font-cairo">{t("alerts.live")}</span>
        </div>
      </div>

      {/* Alert rows */}
      <div className="flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-2 border-[#2E75B6] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : alerts.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-4">{t("alerts.empty")}</p>
        ) : (
          alerts.map((alert, idx) => <AlertRow key={idx} alert={alert} />)
        )}
      </div>
    </div>
  );
}
