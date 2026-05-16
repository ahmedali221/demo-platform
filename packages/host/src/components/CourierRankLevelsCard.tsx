import React, { useEffect, useState } from "react";
import { getCourierRankLevels } from "../api/dashboard.service";
import { useTranslation } from "react-i18next";

interface RankLevel {
  level: string;
  count: number;
  percentage: number;
}

interface CourierRankLevelsResponse {
  referenceEfficiency: string;
  day: number;
  levels: RankLevel[];
}

const levelStyles: Record<string, { bg: string; text: string }> = {
  "-": { bg: "bg-neutral-400",   text: "text-neutral-500" },
  A:   { bg: "bg-emerald-700",   text: "text-emerald-700" },
  B:   { bg: "bg-blue-900",      text: "text-blue-900"    },
  C:   { bg: "bg-orange-500",    text: "text-orange-500"  },
  D:   { bg: "bg-red-600",       text: "text-red-600"     },
  E:   { bg: "bg-zinc-500",      text: "text-zinc-500"    },
};

export default function CourierRankLevelsCard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const [data, setData] = useState<CourierRankLevelsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCourierRankLevels()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch courier rank levels", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-3">
        <div className="w-7 h-7 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-12 text-sm text-neutral-400">
        {t("error.moduleUnavailable")}
      </div>
    );
  }

  const total = data.levels.reduce((sum, l) => sum + l.count, 0);

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="w-full p-6 bg-white rounded-2xl shadow-sm border border-neutral-200 flex flex-col gap-6"
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="flex flex-col">
          <span className="text-black text-xl font-bold leading-7">{t("dashboard.rankLevelsTitle")}</span>
          <span className="text-neutral-500 text-[11px] font-medium leading-tight">
            {t("dashboard.referenceEfficiency")}: {data.referenceEfficiency ?? "—"} · {t("dashboard.day")} {data.day ?? "—"}
          </span>
        </div>
        <div className="w-8 h-8 bg-white rounded-lg border border-neutral-200 shadow-sm flex items-center justify-center flex-shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="7" height="7" rx="1" fill="#1e3a8a" />
            <rect x="3" y="14" width="7" height="7" rx="1" fill="#1e3a8a" opacity="0.4" />
            <rect x="14" y="3" width="7" height="7" rx="1" fill="#1e3a8a" opacity="0.4" />
            <rect x="14" y="14" width="7" height="7" rx="1" fill="#1e3a8a" opacity="0.2" />
          </svg>
        </div>
      </div>

      {/* Level Rows */}
      <div className="flex flex-col gap-4">
        {data.levels.map((level, idx) => {
          const style = levelStyles[level.level] ?? { bg: "bg-gray-400", text: "text-gray-500" };
          const barPct = total > 0 ? (level.count / total) * 100 : 0;

          return (
            <div key={idx} className="flex flex-col gap-1.5">
              {/* Label row */}
              <div className="flex items-center justify-between">
                {/* Level badge */}
                <div className={`w-5 h-5 ${style.bg} rounded-[4px] flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white text-[11px] font-semibold leading-none">{level.level ?? "—"}</span>
                </div>
                {/* Count */}
                <span className={`text-xs font-bold ${style.text}`}>
                  {level.count ?? "—"} {t("dashboard.couriersCount")}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-2 ${style.bg} rounded-full transition-all duration-500`}
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
