import React from "react";
import { useTranslation } from "react-i18next";
import dangerIcon from "../../assets/dangerWarning.svg";
import edit from "../../assets/edit.svg";
import phone from "../../assets/phone.svg";
import note from "../../assets/note.svg";
import DetailsCard from "./DetailsCard";
import type { CourierProfile, CourierKpiSnapshot, LiveStatus, CourierCharts } from "../../types/Couriers";

const VALIDITY_TIER_LABEL: Record<number, string> = { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E" };

const CourierMainDetails = ({
  profile,
  kpi,
  liveStatus,
  charts,
}: {
  profile: CourierProfile;
  kpi: CourierKpiSnapshot | undefined;
  liveStatus: LiveStatus;
  charts: CourierCharts;
}) => {
  const { t } = useTranslation();
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const activeAccount = profile.externalAccounts.find((a) => a.isActive) ?? profile.externalAccounts[0];
  const isHighRisk = profile.currentRiskLevel === 3;
  const onTimePercent = kpi ? Math.round(kpi.onTimeRate * 100) : null;
  const completionPercent = kpi ? Math.round(kpi.avgCompletionRate * 100) : null;
  const tierLabel = kpi ? (VALIDITY_TIER_LABEL[kpi.validityTier] ?? "—") : "—";

  return (
    <div className="bg-[#2020460D] border-[#DFDFDF] rounded-xl shadow-md flex p-6 justify-between">
      <div className="flex flex-col gap-6 items-start">
        <div className="flex gap-4 items-center">
          <span className="h-14 w-14 flex items-center text-xl justify-center bg-[#27AE6040] text-[#27AE60] font-black rounded-2xl">
            {fullName[0]?.toUpperCase() ?? "?"}
          </span>
          <div className="flex flex-col gap-3">
            <div className="flex gap-3 items-center">
              <span className="text-3xl font-bold">{fullName}</span>
              <span className="text-[#B3B3B3] text-sm">{activeAccount?.externalId ?? "—"}</span>
              {isHighRisk && (
                <span className="text-[#EF4444] text-xs bg-[#EF44441A] border border-[#EF444433] rounded-lg px-2 py-1.5 font-semibold flex gap-1">
                  <img src={dangerIcon} /> {t("courier.highDanger")}
                </span>
              )}
            </div>
            <div className="flex gap-4 items-center">
              <div className="flex gap-0.5 items-center">
                <img src={edit} />
                <span className="text-sm text-[#B3B3B3]">{activeAccount?.providerId ?? "—"}</span>
              </div>
              <div className="flex gap-0.5 items-center">
                <img src={note} />
                <span className="text-sm text-[#B3B3B3]">{profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}</span>
              </div>
              <div className="flex gap-0.5 items-center">
                <img src={phone} />
                <span className="text-sm text-[#B3B3B3]">{profile.appPhone ?? "—"}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-4">
          <DetailsCard
            value={kpi?.totalTasksDelivered ?? "—"}
            title={t("courier.numberOfCompletedOrders")}
            description={t("courier.currentMonth")}
            color="#3B82F6"
          />
          <DetailsCard
            value={tierLabel}
            title={t("courier.performanceLevel")}
            description={t("courier.redLowPerformance")}
            color="#3B82F6"
          />
          <DetailsCard
            value={charts.validDaysThisMonth}
            title={t("courier.validDays")}
            description={t("courier.inThisMonth")}
            color="#006733"
          />
          <DetailsCard
            title={t("courier.onTimeDelievryRate")}
            goal={onTimePercent != null ? { threshold: 85, value: onTimePercent } : undefined}
            value={onTimePercent != null ? undefined : "—"}
            color="#BF0101"
          />
          <DetailsCard
            title={t("courier.completionWithoutErrors")}
            goal={completionPercent != null ? { value: completionPercent, threshold: 42 } : undefined}
            value={completionPercent != null ? undefined : "—"}
            color="#E67E22"
          />
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span className={`py-1.5 px-6 rounded-lg border ${liveStatus.currentlyOnline ? "bg-[#27AE6033] border-[#27AE60] text-[#27AE60]" : "bg-[#94A3B833] border-[#94A3B8] text-[#94A3B8]"}`}>
          • {liveStatus.currentlyOnline ? t("courier.activeNow") : t("courier.notActive")}
        </span>
        {liveStatus.lastSeenAt && (
          <span className="text-xs text-[#9CA3AF]">
            {t("courier.lastActivity")}: {new Date(liveStatus.lastSeenAt).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
};

export default CourierMainDetails;
