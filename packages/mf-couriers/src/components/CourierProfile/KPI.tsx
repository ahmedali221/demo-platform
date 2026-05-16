import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import ProgressCard from "../CourierListingPage.tsx/ProgressCard";
import PerformanceStats from "./PerformanceStats";
import { ChartWrapper } from "@ops-brain/shared";
import { DailyRequestsChart, DailyOnlineHoursChart, PerformanceTrendChart } from "./Charts";
import i18n from "../../lib/i18n";
import type { CourierKpiSnapshot, CourierCharts } from "../../types/Couriers";

const VALIDITY_TIER_LABEL: Record<number, string> = { 1: "A", 2: "B", 3: "C", 4: "D", 5: "E" };

const FUTURE_BADGE = (
  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5 ml-1">
    ◈ قريباً
  </span>
);

const KPI = ({ kpis, charts }: { kpis: CourierKpiSnapshot[]; charts: CourierCharts }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("kpis");
  const lang = i18n.language as "ar" | "en";
  const kpi = kpis[0];

  const onTimePercent = kpi ? Math.round(kpi.onTimeRate * 100) : null;
  const cancellationPercent = kpi ? Math.round(kpi.avgCancellationRate * 100) : null;
  const rejectionPercent =
    kpi && kpi.totalTasksAccepted > 0
      ? Math.round((kpi.totalTasksRejected / kpi.totalTasksAccepted) * 100)
      : null;
  const tierLabel = kpi ? (VALIDITY_TIER_LABEL[kpi.validityTier] ?? "—") : "—";
  const totalOnlineHours = charts.dailyOnlineHours.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="pt-6">
      <div className="flex justify-between bg-white rounded-t-2xl">
        <p
          onClick={() => setActiveTab("kpis")}
          className={`text-xl font-bold flex justify-center items-center transition-all ease-in-out flex-1 gap-3 py-5 border-b-4 ${activeTab === "kpis" ? "border-[#1D3478]" : "border-white"}`}
        >
          <span>{t("courier.kpi")}</span>
          <span className="py-1 px-4 bg-[#2E75B61A] border border-[#1D3478] rounded-full font-bold text-xs text-[#1D3478]">
            8 {t("courier.kpis")}
          </span>
        </p>
        <p
          onClick={() => setActiveTab("stats")}
          className={`text-xl font-bold flex justify-center gap-3 items-center flex-1 py-5 transition-all ease-in-out border-b-4 ${activeTab === "stats" ? "border-[#1D3478]" : "border-white"}`}
        >
          {t("courier.performanceAndStats")}
        </p>
      </div>
      <div className="px-3 py-10">
        {activeTab === "kpis" ? (
          <>
            <div className="grid gap-4 2xl:grid-cols-4 md:grid-cols-2 grid-cols-1">
              <ProgressCard
                color="#2E75B6"
                goal={{ value: onTimePercent ?? null, thershold: 85 }}
                icon=""
                title={t("courier.timeEfficiency")}
                description=""
                measurement="%"
              />
              <ProgressCard
                color="#202046"
                goal={{ value: Math.round(totalOnlineHours * 10) / 10, thershold: 8 * 7 }}
                icon=""
                title={t("courier.onlineHours")}
                description=""
                measurement=""
              />
              <ProgressCard
                color="#94A3B8"
                goal={{ value: kpi?.courierEfficiency ?? null, thershold: 100 }}
                icon=""
                title={t("courier.efficiency")}
                description=""
                measurement=""
              />
              <ProgressCard
                color="#8A38F5"
                goal={{ value: null, thershold: 95 }}
                icon=""
                title={
                  <span className="flex items-center gap-1">
                    {t("courier.faceRecoginition")} {FUTURE_BADGE}
                  </span>
                }
                description=""
                measurement="%"
              />
              <ProgressCard
                color="#278F51"
                goal={{ value: null, thershold: 5 }}
                icon=""
                title={
                  <span className="flex items-center gap-1">
                    {t("courier.earlyDelivery")} {FUTURE_BADGE}
                  </span>
                }
                description=""
                measurement="%"
              />
              <ProgressCard
                color="#FBBC05"
                goal={{ value: rejectionPercent ?? null, thershold: 0 }}
                icon=""
                title={t("courier.rejectionPercentage")}
                description=""
                measurement="%"
              />
              <ProgressCard
                color="#BF010199"
                goal={{ value: cancellationPercent ?? null, thershold: 0 }}
                icon=""
                title={t("courier.cancellationPercentage")}
                description=""
                measurement="%"
              />
              <ProgressCard
                color="#C0392B"
                goal={{ value: tierLabel, thershold: t("courier.valid") }}
                icon=""
                title={t("courier.validity")}
                description=""
                measurement=""
              />
            </div>
            <div className="grid gap-4 xl:grid-cols-3 md:grid-cols-1 grid-cols-1 mt-6">
              <ChartWrapper
                icon
                title={t("courier.dailyOrders")}
                description={`${t("courier.todayOrderPerHour")} ◈ قريباً`}
              >
                <PerformanceTrendChart lang={lang} />
              </ChartWrapper>

              <ChartWrapper
                title={t("courier.dailyOrders")}
                description={t("courier.lastDays")}
              >
                <DailyRequestsChart data={charts.dailyOrders} lang={lang} />
              </ChartWrapper>

              <ChartWrapper
                title={t("courier.onlineHours")}
                description={t("courier.lastDays")}
              >
                <DailyOnlineHoursChart data={charts.dailyOnlineHours} lang={lang} />
              </ChartWrapper>
            </div>
          </>
        ) : (
          <PerformanceStats kpi={kpi} charts={charts} />
        )}
      </div>
    </div>
  );
};

export default KPI;
