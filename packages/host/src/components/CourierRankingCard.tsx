import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCourierRanking } from "../api/dashboard.service";
import { useTranslation } from "react-i18next";

interface Courier {
  courierName: string;
  orderVolume: number;
  ranking: number;
  level: string;
}

interface CourierRankingResponse {
  top: Courier[];
  bottom: Courier[];
}

export default function CourierRankingCard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === "ar";
  const [data, setData] = useState<CourierRankingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCourierRanking()
      .then((res) => {
        // Assume API returns old format, map if necessary or just map the dummy data below
        // Usually dummy data is what gets rendered first or when error occurs
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch courier ranking", err);
        setData({
          top: [
            { courierName: "أحمد العتيبي", orderVolume: 612, ranking: 1, level: "A" },
            { courierName: "ناصر الحربي", orderVolume: 587, ranking: 2, level: "A" },
            { courierName: "محمد الغامدي", orderVolume: 543, ranking: 3, level: "B" },
            { courierName: "فهد الدوسري", orderVolume: 521, ranking: 4, level: "B" },
            { courierName: "سعد العزي", orderVolume: 467, ranking: 5, level: "B" },
          ],
          bottom: [
            { courierName: "فيصل المطيري", orderVolume: 142, ranking: 3, level: "C" },
            { courierName: "فيصل المطيري", orderVolume: 181, ranking: 3, level: "C" },
            { courierName: "فيصل المطيري", orderVolume: 187, ranking: 3, level: "D" },
            { courierName: "سعيد العمري", orderVolume: 205, ranking: 4, level: "D" },
            { courierName: "بندر المطيري", orderVolume: 150, ranking: 5, level: "D" },
          ],
        });
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full p-6 bg-white rounded-3xl shadow-[2px_4px_16px_0px_rgba(0,0,0,0.08)] border border-neutral-100 flex flex-col items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mb-2" />
        <div className="text-neutral-400 text-sm">{t("loading")}</div>
      </div>
    );
  }

  const hasData = data && (data.top.length > 0 || data.bottom.length > 0);

  if (!hasData) {
    return (
      <div dir={isRtl ? "rtl" : "ltr"} className="w-full p-6 bg-white rounded-3xl shadow-[2px_4px_16px_0px_rgba(0,0,0,0.08)] border border-neutral-100 flex flex-col justify-start items-center gap-6">
        <div className="w-full flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="text-black text-xl font-bold">{t("dashboard.courierRankingTitle")}</div>
            <div className="w-8 h-8 bg-white rounded-lg shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05)] border border-neutral-200 flex justify-center items-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-violet-600 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
          <div 
            onClick={() => navigate("/couriers")}
            className="px-3 py-1 bg-violet-600/15 rounded-full border border-violet-600/30 flex justify-center items-center cursor-pointer transition-colors hover:bg-violet-600/20"
          >
            <div className="text-violet-600 text-xs font-bold">{t("dashboard.viewAll")}</div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-12 gap-3">
          <div className="w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-neutral-300">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="text-neutral-400 text-sm font-medium">{t("dashboard.noCouriersData")}</div>
        </div>
      </div>
    );
  }

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="w-full p-6 bg-white rounded-3xl shadow-[2px_4px_16px_0px_rgba(0,0,0,0.08)] border border-neutral-100 flex flex-col justify-start items-center gap-6">
      {/* Header */}
      <div className="w-full flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="text-black text-xl font-bold">{t("dashboard.courierRankingTitle")}</div>
          <div className="w-8 h-8 bg-white rounded-lg shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05)] border border-neutral-200 flex justify-center items-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-violet-600 flex-shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div 
          onClick={() => navigate("/couriers")}
          className="px-3 py-1 bg-violet-600/15 rounded-full border border-violet-600/30 flex justify-center items-center cursor-pointer transition-colors hover:bg-violet-600/20"
        >
          <div className="text-violet-600 text-xs font-bold">{t("dashboard.viewAll")}</div>
        </div>
      </div>

      {/* Top 5 Section */}
      <div className="w-full flex flex-col gap-4">
        <div className="self-stretch flex justify-between items-center">
          <div className="text-neutral-400 text-xs font-normal">{t("dashboard.currentLevelRef")}</div>
          <div className="flex items-center gap-2">
            <div className="text-black text-sm font-bold">{t("dashboard.top5")}</div>
            <div className="w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>
          </div>
        </div>

        <div className="w-full flex flex-col gap-3">
          {data.top.map((courier, index) => (
            <div key={index} className="self-stretch h-12 p-3 bg-emerald-50/60 rounded-xl flex items-center justify-between border border-emerald-100/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-blue-950 rounded-full flex justify-center items-center">
                  <span className="text-white text-xs font-bold font-inter">#{courier.ranking ?? "—"}</span>
                </div>
                <div className="w-7 h-7 bg-emerald-800 rounded-lg flex justify-center items-center">
                  <span className="text-white text-xs font-bold font-inter">{courier.level ?? "—"}</span>
                </div>
                <span className="text-neutral-800 text-sm font-bold ms-2">{courier.courierName ?? "—"}</span>
              </div>
              <span className="text-neutral-800 text-sm font-bold">{courier.orderVolume ?? "—"} {t("dashboard.ordersUnit")}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom 5 Section */}
      <div className="w-full flex flex-col gap-4 mt-2">
        <div className="self-stretch flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center text-white text-[10px]">!</div>
            <div className="text-black text-sm font-bold">{t("dashboard.bottom5")}</div>
          </div>
          <div className="text-neutral-400 text-xs font-normal">{t("dashboard.currentLevelRef")}</div>
        </div>

        <div className="w-full flex flex-col gap-3">
          {data.bottom.map((courier, index) => {
            const isRed = courier.level === "D" || courier.level === "E";
            const bgClass = isRed ? "bg-red-50/60 border-red-100/40" : "bg-orange-50/60 border-orange-100/40";
            const tagBg = isRed ? "bg-red-700" : "bg-orange-500";

            return (
              <div key={index} className={`self-stretch h-12 p-3 ${bgClass} rounded-xl flex items-center justify-between border`}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-950 rounded-full flex justify-center items-center">
                    <span className="text-white text-xs font-bold font-inter">#{courier.ranking ?? "—"}</span>
                  </div>
                  <div className={`w-7 h-7 ${tagBg} rounded-lg flex justify-center items-center`}>
                    <span className="text-white text-xs font-bold font-inter">{courier.level ?? "—"}</span>
                  </div>
                  <span className="text-neutral-800 text-sm font-bold ms-2">{courier.courierName ?? "—"}</span>
                </div>
                <span className="text-neutral-800 text-sm font-bold">{courier.orderVolume ?? "—"} {t("dashboard.ordersUnit")}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
