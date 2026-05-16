import React, { useState } from "react";
import info from "../../assets/info.svg";
import guard from "../../assets/guard.svg";
import danger from "../../assets/dangerIcon.svg";
import { useTranslation } from "react-i18next";
import SummaryCard from "./SummaryCard";
import FilterOption from "./FilterOption";
import ViolationCard from "./ViolationCard";
import type { ViolationsResponse, CourierCharts, ViolationItem } from "../../types/Couriers";

const VIOLATION_TYPE_AR: Record<number, string> = {
  1: "فتح الشفت متأخر",
  2: "إغلاق الشفت مبكراً",
  3: "عدم الاتصال أثناء الذروة",
  4: "رفض الطلب",
  5: "تأخر التوصيل",
  6: "تأخر الإلغاء",
  7: "غياب",
};

const ESCALATION_AR: Record<number, string> = {
  0: "بدون إجراء",
  1: "تحذير",
  2: "إعادة تدريب",
  3: "إيقاف 3 ساعات",
  4: "إيقاف يوم",
  5: "إيقاف موسّع",
};

const ViolationDetails = ({
  courierId,
  violations,
  violationsActive,
  violationsResolved,
  charts,
}: {
  courierId: string;
  violations: ViolationsResponse;
  violationsActive: ViolationsResponse;
  violationsResolved: ViolationsResponse;
  charts: CourierCharts;
}) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<"all" | "active" | "resolved">("all");

  const currentItems: ViolationItem[] =
    filter === "all"
      ? violations.items
      : filter === "active"
      ? violationsActive.items
      : violationsResolved.items;

  const currentTotal =
    filter === "all"
      ? violations.total
      : filter === "active"
      ? violationsActive.total
      : violationsResolved.total;

  const lateShiftOpenCount = violations.items.filter((v) => v.violationType === 1).length;
  const earlyShiftCloseCount = violations.items.filter((v) => v.violationType === 2).length;
  const noShowCount = violations.items.filter((v) => v.violationType === 7).length;

  return (
    <div className="flex gap-7 py-6">
      <div className="bg-white border border-[#DFDFDF] rounded-xl p-6 flex-2">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <img src={info} />
            <span className="text-xl font-bold">{t("courier.violationHistory")}</span>
          </div>
          <span className="text-sm text-[#94A3B8]">{currentTotal} {t("courier.violations") ?? "مخالفة"}</span>
        </div>
        <div className="flex gap-3 py-2 px-3 rounded-md justify-self-end mt-6 border border-[#DFDFDF]">
          <FilterOption status={filter === "all"} onClick={() => setFilter("all")}>
            {t("courier.all")} ({violations.total})
          </FilterOption>
          <FilterOption status={filter === "active"} onClick={() => setFilter("active")}>
            {t("courier.activeOnly")} ({violationsActive.total})
          </FilterOption>
          <FilterOption status={filter === "resolved"} onClick={() => setFilter("resolved")}>
            {t("courier.solved")} ({violationsResolved.total})
          </FilterOption>
        </div>
        <div className="flex flex-col gap-3 mt-4">
          {currentItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-neutral-400">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-50">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm font-medium">{t("courier.noViolations")}</p>
            </div>
          ) : (
            currentItems.map((v) => (
              <ViolationCard
                key={v.id}
                action={ESCALATION_AR[v.escalationAction] ?? String(v.escalationAction)}
                date={v.occurredAt ? new Date(v.occurredAt).toLocaleDateString() : "—"}
                title={VIOLATION_TYPE_AR[v.violationType] ?? String(v.violationType)}
                isResolved={v.isResolved}
              />
            ))
          )}
        </div>
      </div>
      <div className="bg-white border border-[#DFDFDF] rounded-xl p-6 flex-1 flex flex-col gap-6">
        <div className="flex gap-2">
          <img src={guard} />
          <span className="text-xl font-bold">{t("courier.shiftDiscipline")}</span>
        </div>
        <div className="flex flex-col gap-3">
          <SummaryCard text={t("courier.lateShiftOpen")} numberOfViolaionts={lateShiftOpenCount} />
          <SummaryCard text="إغلاق الشفت مبكراً" numberOfViolaionts={earlyShiftCloseCount} />
          <SummaryCard text="غياب" numberOfViolaionts={noShowCount} />
        </div>
        {charts.continuousDecline && (
          <div className="bg-[#EF44441A] border border-[#C0392B] rounded-xl p-4 flex gap-3">
            <img src={danger} />
            <div className="flex flex-col gap-1">
              <p className="font-bold text-[#C0392B]">{t("courier.continousDecrease")}</p>
              <p className="text-sm text-[#94A3B8]">{t("courier.last7DaysCompared")}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViolationDetails;
