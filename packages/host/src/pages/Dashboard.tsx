import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useUserStore } from "../store/auth.store";
import ChartWrapper from "../components/ui/ChartWrapper";
import SafetyDonutChart from "../components/ui/DonutChart";
import ShiftDataCard from "../components/ShiftDataCard";
import ViolationsCounterCard from "../components/ViolationsCounterCard";
import AutoAlertsCard from "../components/AutoAlertsCard";
import CourierRankingCard from "../components/CourierRankingCard";
import CourierRankLevelsCard from "../components/CourierRankLevelsCard";
import {
  CancellationRateChart,
  CompletedOrdersChart,
  OnTimeGaugeChart,
  OrdersPerHourChart,
  RejectionRateChart,
  ShipmentAttendanceChart,
  CourierEfficiencyChart,
} from "../components/ui/Charts";

import greenGuage from "../assets/green-chart.svg";
import orangeGuage from "../assets/orange-guage.svg";
import purpleGuage from "../assets/purple-guage.svg";
import { getFleetData } from "../api/dashboard.service";
import { useEffect, useState, useMemo, useCallback } from "react";
import { DashboardMetrics } from "../types/dashboard";

type Period = "daily" | "weekly" | "monthly";

const formatDateForApi = (date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
};

const getPeriodInterval = (period: Period) => {
  const to = new Date();
  const from = new Date();

  if (period === "weekly") {
    from.setDate(to.getDate() - 7);
  } else if (period === "monthly") {
    from.setMonth(to.getMonth() - 1);
  }
  // daily: from = to = today

  return {
    from: formatDateForApi(from),
    to: formatDateForApi(to),
  };
};

export default function Dashboard() {
  const { logout } = useUserStore();
  const navigate = useNavigate();
  const [fleetData, setFleetData] = useState<DashboardMetrics>();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("daily");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const activeInterval = useMemo(() => {
    if (fromDate && toDate) {
      return { from: fromDate, to: toDate };
    }
    if (fromDate || toDate) {
      return null;
    }
    return getPeriodInterval(period);
  }, [period, fromDate, toDate]);

  const fetchData = useCallback(async () => {
    if (!activeInterval) return;
    setLoading(true);
    try {
      const data = await getFleetData(activeInterval.from, activeInterval.to);
      setFleetData(data);
    } catch (error) {
      console.error("Error fetching fleet data:", error);
    } finally {
      setLoading(false);
    }
  }, [activeInterval]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="p-4 md:p-8 min-w-0" dir={isRtl ? "rtl" : "ltr"}>
      {/* Top bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl font-black text-gray-900">
          {t("dashboard.title")}
        </h1>
        <div className="flex items-center gap-4">
          {/* Period Tabs */}
          <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
            {(["daily", "weekly", "monthly"] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => {
                  setPeriod(p);
                  setFromDate("");
                  setToDate("");
                }}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${
                  period === p && !fromDate
                    ? "bg-[#1D3478] text-white"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                {t(`dashboard.filter.${p}`)}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="bg-transparent outline-none text-sm text-gray-700"
            />
          </div>
        </div>
      </div>

      {/* Metrics cards */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-[#2E75B6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid 2xl:grid-cols-4 xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 mb-4">
            <ChartWrapper
              icon={<img src={greenGuage} />}
              bgColor="#27AE6040"
              color="#006733"
              status={t("dashboard.stats.goal")}
              title={t("dashboard.stats.completedOrders")}
            >
              <CompletedOrdersChart value={fleetData?.completedOrdersCount ?? 0} />
            </ChartWrapper>
            <ChartWrapper
              icon={<img src={purpleGuage} />}
              bgColor="#8A38F526"
              color="#8A38F5"
              status={t("dashboard.stats.goal99%")}
              title={t("dashboard.stats.deliveryOnTime")}
            >
              <OnTimeGaugeChart value={fleetData?.onTimeDeliveryRate ?? 0} />
            </ChartWrapper>
            <ChartWrapper
              icon={<img src={purpleGuage} />}
              bgColor="#BF010126"
              color="#BF0101"
              status={t("dashboard.stats.lessThanGoal")}
              title={t("dashboard.stats.cancellationRate")}
            >
              <CancellationRateChart label={fleetData?.cancellationRate ?? 0} />
            </ChartWrapper>
            <ChartWrapper
              icon={<img src={orangeGuage} />}
              bgColor="#FF8F0D40"
              color="#E67E22"
              status={t("dashboard.stats.goal12%")}
              title={t("dashboard.stats.rejectionRate")}
            >
              <RejectionRateChart
                label={`${fleetData?.rejectionRate ?? 0}%`}
                progress={fleetData?.rejectionRate ?? 0}
              />
            </ChartWrapper>
          </div>
          <div className="grid 2xl:grid-cols-4 col-span-2 xl:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-4 mb-8">
            <ChartWrapper
              className="col-span-2"
              icon={<img src={orangeGuage} />}
              bgColor="#27AE6040"
              color="#006733"
              status={t("dashboard.stats.currentMonth")}
              title={t("dashboard.stats.ordersPerHour")}
            >
              <OrdersPerHourChart data={fleetData?.hourlyOrders} />
            </ChartWrapper>
            <ChartWrapper
              icon={<img src={orangeGuage} />}
              bgColor="#27AE6040"
              color="#938C9C"
              title={t("dashboard.stats.shiftAttendance")}
            >
              <ShipmentAttendanceChart label={fleetData?.attendanceRate != null ? `${fleetData.attendanceRate}%` : "0%"} />
            </ChartWrapper>
            <ChartWrapper
              icon={<img src={orangeGuage} />}
              bgColor="#27AE6040"
              color="#E67E22"
              title={t("dashboard.stats.courierEfficiency")}
            >
              <CourierEfficiencyChart value={fleetData?.courierEfficiency ?? 0} />
            </ChartWrapper>
          </div>
        </>
      )}

      {/* Shift Data Card */}
      <div className="mb-8">
        <ShiftDataCard />
      </div>

      {/* Courier Ranking & Level Cards */}
      <div className="flex flex-col xl:flex-row gap-6 items-start">
        <div className="flex-1 min-w-0">
          <CourierRankingCard />
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-6">
          <AutoAlertsCard />
          <ViolationsCounterCard />
          <CourierRankLevelsCard />
        </div>
      </div>
    </div>
  );
}
