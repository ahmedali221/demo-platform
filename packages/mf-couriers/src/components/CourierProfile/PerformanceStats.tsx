import SectionTitle from "./SectionTitle";
import { useTranslation } from "react-i18next";
import ProgressCard from "../CourierListingPage.tsx/ProgressCard";
import type { CourierKpiSnapshot, CourierCharts } from "../../types/Couriers";

const FUTURE_BADGE = (
  <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-600 bg-purple-50 border border-purple-200 rounded-full px-2 py-0.5 ml-1">
    ◈ قريباً
  </span>
);

const PerformanceStats = ({
  kpi,
  charts,
}: {
  kpi: CourierKpiSnapshot | undefined;
  charts: CourierCharts;
}) => {
  const { t } = useTranslation();

  return (
    <div>
      <SectionTitle title={t("courier.firstSection")} />
      <div className="grid xl:grid-cols-3 md:grid-cols-3 grid-cols-1 gap-4 py-4">
        <ProgressCard
          goal={{ value: kpi?.totalTasksDelivered ?? 0 }}
          color="#2E75B6"
          title={t("courier.totalCompletedOrders")}
          label={t("courier.directApi")}
          labelColor="#006733"
          labelBg="#61DE8A33"
        />
        <ProgressCard
          goal={{ value: kpi?.totalTasksRejectedAuto ?? 0 }}
          color="#2E75B6"
          title={t("courier.cancelledOrdersCauseOfDeliveryIssues")}
          label={t("courier.incentivesManagament")}
          labelColor="#E67E22"
          labelBg="#E67E2233"
        />
        <ProgressCard
          goal={{ value: kpi?.totalTasksRejected ?? 0 }}
          color="#2E75B6"
          title={t("courier.cancelledOrders")}
          label={t("courier.directApi")}
          labelColor="#006733"
          labelBg="#61DE8A33"
        />
      </div>

      <SectionTitle title={t("courier.secondSection")} />
      <div className="grid xl:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-4 py-4">
        <ProgressCard
          goal={{ value: kpi ? (kpi.totalTasksDelivered + kpi.totalTasksRejected) : 0 }}
          color="#E67E22"
          title={t("courier.totalViolations")}
          label={t("courier.directApi")}
          labelColor="#006733"
          labelBg="#61DE8A33"
        />
        <ProgressCard
          goal={{ value: kpi?.totalTasksRejectedAuto ?? 0 }}
          color="#B3B3B3"
          title={t("courier.wrongViolations")}
          label={t("courier.directApi")}
          labelColor="#E67E22"
          labelBg="#E67E2233"
        />
        <ProgressCard
          goal={{ value: kpi?.totalTasksRejected ?? 0 }}
          color="#BF0101"
          title={t("courier.validViolations")}
          label={t("courier.BECalculated")}
          labelColor="#1D3478"
          labelBg="#1D347833"
        />
        <ProgressCard
          goal={{ value: "—" }}
          color="#278F51"
          title={
            <span className="flex items-center gap-1">
              {t("courier.courierHistoryRate")} {FUTURE_BADGE}
            </span>
          }
          label={t("courier.BECalculated")}
          labelColor="#1D3478"
          labelBg="#1D347833"
        />
      </div>

      <SectionTitle title={t("courier.thirdSection")} />
      <div className="grid md:grid-cols-2 grid-cols-1 gap-4 py-4">
        <ProgressCard
          goal={{ value: "—" }}
          color="#E67E22"
          title={
            <span className="flex items-center gap-1">
              {t("courier.earlyDelivery")} {FUTURE_BADGE}
            </span>
          }
          label={t("courier.BECalculated")}
          labelColor="#006733"
          labelBg="#61DE8A33"
        />
        <ProgressCard
          goal={{ value: charts.avgOnlineHoursPerDay != null ? `${charts.avgOnlineHoursPerDay.toFixed(1)} س/يوم` : "—" }}
          color="#1D3478"
          title={t("courier.validHours")}
          label={t("courier.BECalculated")}
          labelColor="#E67E22"
          labelBg="#E67E2233"
        />
      </div>
    </div>
  );
};

export default PerformanceStats;
