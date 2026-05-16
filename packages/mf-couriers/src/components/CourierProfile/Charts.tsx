import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import type { DailyDataPoint } from "../../types/Couriers";

type ChartLang = "ar" | "en";

function CustomTooltip({ active, payload, label, lang }: any) {
  if (!active || !payload?.length) return null;
  const tooltipLabel = lang === "ar" ? "القيمة" : "Value";
  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-xs shadow-[0px_4px_12px_rgba(0,0,0,0.1)] flex flex-col items-center gap-1 min-w-[80px]"
    >
      <div className="font-bold text-[#191C1E]">{label}</div>
      <div className="text-gray-500 font-semibold">
        {tooltipLabel}: {payload[0].value}
      </div>
    </div>
  );
}

function formatDate(dateStr: string, lang: ChartLang) {
  const d = new Date(dateStr);
  return lang === "ar"
    ? `${d.getMonth() + 1}/${d.getDate()}`
    : `${d.getMonth() + 1}/${d.getDate()}`;
}

const BAR_COLORS = ["#ef4444", "#f87171", "#f97316", "#eab308", "#22c55e", "#22c55e", "#4ade80"];

/* =========================
   1) Daily Requests Chart (from API)
========================= */

export function DailyRequestsChart({
  data,
  lang = "ar",
}: {
  data: DailyDataPoint[];
  lang?: ChartLang;
}) {
  if (!data.length) {
    return (
      <div className="h-[180px] w-full flex items-center justify-center text-neutral-400 text-sm">
        {lang === "ar" ? "لا توجد بيانات" : "No data"}
      </div>
    );
  }
  const chartData = data.map((d, i) => ({
    day: formatDate(d.date, lang),
    value: d.value,
    color: BAR_COLORS[i % BAR_COLORS.length],
  }));
  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e5e7eb" strokeOpacity={0.7} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#111827", fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#111827" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip lang={lang} />} cursor={{ fill: "#f3f4f6", opacity: 0.8 }} />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={26}>
            {chartData.map((entry) => (
              <Cell key={entry.day} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* =========================
   2) Daily Online Hours Chart (from API)
========================= */

export function DailyOnlineHoursChart({
  data,
  lang = "ar",
}: {
  data: DailyDataPoint[];
  lang?: ChartLang;
}) {
  if (!data.length) {
    return (
      <div className="h-[180px] w-full flex items-center justify-center text-neutral-400 text-sm">
        {lang === "ar" ? "لا توجد بيانات" : "No data"}
      </div>
    );
  }
  const chartData = data.map((d) => ({ day: formatDate(d.date, lang), value: d.value }));
  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="hoursGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2E75B6" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#2E75B6" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e5e7eb" strokeOpacity={0.7} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#111827", fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#111827" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip lang={lang} />} />
          <Area type="monotone" dataKey="value" stroke="#2E75B6" strokeWidth={2} fill="url(#hoursGradient)" dot={{ r: 4, fill: "#2E75B6", stroke: "#2E75B6" }} activeDot={{ r: 5, fill: "#2E75B6", stroke: "#2E75B6" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* =========================
   3) Performance Trend Chart — FUTURE (placeholder)
========================= */

export function PerformanceTrendChart({ lang = "ar" }: { lang?: ChartLang }) {
  const days = {
    ar: ["السبت", "الجمعة", "الخميس", "الأربعاء", "الثلاثاء", "الاثنين", "الأحد"],
    en: ["Sat", "Fri", "Thu", "Wed", "Tue", "Mon", "Sun"],
  };
  const data = [98, 120, 70, 70, 85, 84, 115].map((value, i) => ({ day: days[lang][i], value }));

  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="performanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#ef4444" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e5e7eb" strokeOpacity={0.7} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#111827", fontWeight: 600 }} axisLine={false} tickLine={false} />
          <YAxis domain={[40, 170]} ticks={[40, 80, 120, 160]} tick={{ fontSize: 12, fill: "#111827" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip lang={lang} />} />
          <Area type="monotone" dataKey="value" stroke="#dc2626" strokeWidth={2} fill="url(#performanceGradient)" dot={{ r: 4, fill: "#dc2626", stroke: "#dc2626" }} activeDot={{ r: 5, fill: "#dc2626", stroke: "#dc2626" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
