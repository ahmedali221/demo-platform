import React, { useEffect, useState } from "react";
import { getShiftData } from "../api/dashboard.service";
import { useTranslation } from "react-i18next";

interface Shift {
  shiftName: string;
  durationHours: number;
  fillRate: number;
  remaining: number;
  booked: number;
  status: "WithinTarget" | "Close" | "Exceeded";
}

interface ShiftDataResponse {
  shifts: Shift[];
  shiftsWithinTarget: number;
  shiftsExceeded: number;
  totalRemaining: number | null;
  totalBooked: number | null;
}

const EMPTY_DATA: ShiftDataResponse = {
  shifts: [
    { shiftName: "—", durationHours: 0, fillRate: 0, remaining: 0, booked: 0, status: "WithinTarget" },
    { shiftName: "—", durationHours: 0, fillRate: 0, remaining: 0, booked: 0, status: "WithinTarget" },
    { shiftName: "—", durationHours: 0, fillRate: 0, remaining: 0, booked: 0, status: "WithinTarget" },
  ],
  shiftsWithinTarget: 0,
  shiftsExceeded: 0,
  totalRemaining: null,
  totalBooked: null,
};

export default function ShiftDataCard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const [data, setData] = useState<ShiftDataResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShiftData()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch shift data", err);
        setLoading(false);
      });
  }, []);

  const display = data ?? EMPTY_DATA;
  const shifts = display.shifts?.length ? display.shifts : EMPTY_DATA.shifts;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 gap-3">
        <div className="w-7 h-7 border-4 border-blue-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="w-full p-4 bg-white rounded-2xl shadow-[2px_4px_8px_0px_rgba(0,0,0,0.25)] outline outline-1 outline-offset-[-1px] outline-neutral-200 flex flex-col gap-6"
    >
      {/* Top section */}
      <div className="flex flex-col gap-6">
        {/* Header row */}
        <div className="flex justify-between items-center">
          {/* Title */}
          <div className="flex items-center gap-2">
            <span className="text-black text-xl font-bold leading-7">{t("dashboard.shiftDataTitle")}</span>
            <div className="w-8 h-8 bg-white rounded-lg shadow-[0px_0px_0px_1px_rgba(0,0,0,0.05)] outline outline-[1.5px] outline-offset-[-1.5px] outline-neutral-200 flex items-center justify-center">
              <div className="w-5 h-5 outline outline-2 outline-offset-[-1px] outline-gray-800 rounded-sm" />
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4">
            <div className="h-8 px-2 rounded-full outline outline-1 outline-offset-[-1px] outline-neutral-200 flex items-center gap-2">
              <span className="text-red-700 text-xs font-medium font-cairo">{t("dashboard.exceeded")}</span>
              <div className="w-3.5 h-3.5 bg-red-700 rounded-full" />
            </div>
            <div className="h-8 px-2 rounded-full outline outline-1 outline-offset-[-1px] outline-neutral-200 flex items-center gap-2">
              <span className="text-orange-500 text-xs font-medium font-cairo">{t("dashboard.close")}</span>
              <div className="w-3.5 h-3.5 bg-orange-500 rounded-full" />
            </div>
            <div className="h-8 px-2 rounded-full outline outline-1 outline-offset-[-1px] outline-neutral-200 flex items-center gap-2">
              <span className="text-emerald-800 text-xs font-medium font-cairo">{t("dashboard.withinTarget")}</span>
              <div className="w-3.5 h-3.5 bg-emerald-800 rounded-full" />
            </div>
          </div>
        </div>

        {/* Shift Cards */}
        <div className="w-full overflow-x-auto">
          <div className="flex justify-around items-center mx-auto">
            {shifts.map((shift, idx) => {
              const isExceeded = shift.status === "Exceeded";
              const isClose = shift.status === "Close";

              const headerBg    = isExceeded ? "bg-red-700"    : isClose ? "bg-orange-500" : "bg-blue-900";
              const cardOutline = isExceeded ? "outline outline-1 outline-offset-[-1px] outline-red-700"
                                : isClose    ? "outline outline-1 outline-offset-[-1px] outline-orange-500"
                                : "";
              const progressBg  = isExceeded ? "bg-red-700"    : isClose ? "bg-orange-500" : "bg-emerald-800";
              const fillLabel   = isExceeded ? t("dashboard.exceeded") : `${shift.fillRate}%`;
              const fillColor   = isExceeded ? "text-red-700"  : isClose ? "text-orange-500" : "text-emerald-800";

              // Remaining box: blue for WithinTarget & Close, red for Exceeded
              const remBg   = isExceeded ? "bg-red-500/20"   : "bg-blue-900/20";
              const remText = isExceeded ? "text-red-700"    : "text-blue-900";

              // Booked box: emerald for WithinTarget, orange for Close, red for Exceeded
              const bookBg   = isExceeded ? "bg-red-500/20"    : isClose ? "bg-orange-500/20"  : "bg-emerald-800/20";
              const bookText = isExceeded ? "text-red-700"     : isClose ? "text-orange-500"   : "text-emerald-800";

              return (
                <div
                  key={idx}
                  className={`w-44 h-56 px-1.5 pb-5 bg-white rounded-2xl shadow-[0px_2px_4px_0px_rgba(0,0,0,0.15)] ${cardOutline} flex flex-col items-center gap-4 overflow-hidden flex-shrink-0`}
                >
                  {/* Card header */}
                  <div className={`w-44 h-20 py-3 ${headerBg} flex flex-col items-center justify-center gap-2.5`}>
                    <span className="w-28 text-center text-white text-base font-semibold font-inter leading-4">{shift.shiftName}</span>
                    <span className="text-white text-xs font-semibold font-inter leading-4">
                      {shift.durationHours} <span className="font-cairo">{t("dashboard.hour")}</span>
                    </span>
                  </div>

                  {/* Fill rate + progress bar */}
                  <div className="w-40 flex flex-col gap-2">
                    <span className={`${fillColor} text-[10px] font-bold font-inter leading-4`}>{fillLabel}</span>
                    <div className="relative h-2.5 bg-gray-100 rounded-xl overflow-hidden">
                      <div
                        className={`h-2.5 absolute top-0 ${progressBg} rounded-xl`}
                        style={{ width: `${Math.min(shift.fillRate, 100)}%`, [isRtl ? "right" : "left"]: 0 }}
                      />
                      <div className="w-2.5 h-0 left-[45px] top-0 absolute origin-top-left rotate-90 outline outline-2 outline-offset-[-1px] outline-red-700" />
                    </div>
                  </div>

                  {/* Remaining & Booked */}
                  <div className="w-40 flex justify-center items-start gap-3">
                    <div className={`w-20 h-16 p-3 ${remBg} rounded-lg outline outline-1 outline-offset-[-1px] flex flex-col items-center justify-center`}>
                      <span className={`${remText} text-base font-bold font-inter leading-6`}>{shift.remaining ?? "—"}</span>
                      <span className={`${remText} text-[10px] font-semibold font-cairo leading-4`}>{t("dashboard.remaining")}</span>
                    </div>
                    <div className={`w-16 h-16 p-3 ${bookBg} rounded-lg outline outline-1 outline-offset-[-1px] flex flex-col items-center justify-center`}>
                      <span className={`${bookText} text-base font-bold font-inter leading-6`}>{shift.booked ?? "—"}</span>
                      <span className={`${bookText} text-[10px] font-semibold font-cairo leading-4`}>{t("dashboard.booked")}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {(!data || !data.shifts?.length) && (
          <p className="text-center text-xs text-neutral-400 font-cairo">
            {t("dashboard.noShiftsFile")}
          </p>
        )}
      </div>

      {/* Footer stats */}
      <div className="flex flex-col gap-6">
        <div className="w-full h-px bg-neutral-200" />
        <div className="flex justify-center items-center gap-6">
          <div className="w-60 flex flex-col items-center gap-3">
            <span className="text-emerald-800 text-2xl font-bold font-inter leading-6">{display.shiftsWithinTarget ?? "—"}</span>
            <span className="text-neutral-400 text-sm font-medium font-cairo leading-6">{t("dashboard.shiftsWithinTarget")}</span>
          </div>
          <div className="w-px h-24 bg-neutral-200" />
          <div className="w-60 flex flex-col items-center gap-3">
            <span className="text-red-700 text-2xl font-bold font-inter leading-6">{display.shiftsExceeded ?? "—"}</span>
            <span className="text-neutral-400 text-sm font-medium font-cairo leading-6">{t("dashboard.shiftsExceeded")}</span>
          </div>
          <div className="w-px h-24 bg-neutral-200" />
          <div className="w-60 flex flex-col items-center gap-3">
            <span className="text-emerald-800 text-2xl font-bold font-inter leading-6">{display.totalRemaining ?? "—"}</span>
            <span className="text-neutral-400 text-sm font-medium font-cairo leading-6">{t("dashboard.totalRemaining")}</span>
          </div>
          <div className="w-px h-24 bg-neutral-200" />
          <div className="w-60 flex flex-col items-center gap-3">
            <span className="text-blue-900 text-2xl font-bold font-inter leading-6">{display.totalBooked ?? "—"}</span>
            <span className="text-neutral-400 text-sm font-medium font-cairo leading-6">{t("dashboard.totalBooked")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
