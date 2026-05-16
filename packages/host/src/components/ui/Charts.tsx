import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { HourlyOrder } from "../../types/dashboard";

/* =========================
   Helpers
========================= */

type CommonProps = {
  className?: string;
};

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function describeArc(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}

/* Reusable tooltip bubble */
function TooltipBubble({ text }: { text: string }) {
  return (
    <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-md px-2.5 py-1.5 whitespace-nowrap z-30 pointer-events-none shadow-lg">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
    </div>
  );
}

/* =========================
   1) Rejection Rate Donut
========================= */

type RejectionRateChartProps = CommonProps & {
  label?: string;
  progress?: number;
  maxValue?: number;
  goalValue?: number;
};

export function RejectionRateChart({
  label = "0%",
  progress = 0,
  maxValue = 15,
  goalValue = 12,
  className = "",
}: RejectionRateChartProps) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);

  const radius = 52;
  const stroke = 14;
  const circumference = 2 * Math.PI * radius;

  const scaledProgress = Math.min((progress / maxValue) * 100, 100);
  const dashOffset = circumference - (scaledProgress / 100) * circumference;
  const arcColor = progress >= goalValue ? "#ef4444" : "#ff7a13";

  const goalFraction = Math.min(goalValue / maxValue, 1);
  const goalAngleRad = ((-90 + goalFraction * 360) * Math.PI) / 180;
  const tickInnerR = radius - stroke / 2 - 1;
  const tickOuterR = radius + stroke / 2 + 1;
  const tickX1 = 60 + tickInnerR * Math.cos(goalAngleRad);
  const tickY1 = 60 + tickInnerR * Math.sin(goalAngleRad);
  const tickX2 = 60 + tickOuterR * Math.cos(goalAngleRad);
  const tickY2 = 60 + tickOuterR * Math.sin(goalAngleRad);

  return (
    <div className={`flex items-end justify-center gap-6 ${className}`}>
      <div className="text-[32px] font-bold leading-none text-black">{label}</div>
      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && <TooltipBubble text={t("dashboard.charts.rejectionTooltip", { value: label, goal: goalValue })} />}
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="#e1e1e1" strokeWidth={stroke} />
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={arcColor}
            strokeWidth={stroke}
            strokeLinecap="butt"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 60 60)"
          />
          <line
            x1={tickX1} y1={tickY1} x2={tickX2} y2={tickY2}
            stroke="#475569" strokeWidth="2.5" strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

/* =========================
   2) Cancellation Mini Bars
========================= */

type CancellationRateChartProps = CommonProps & {
  label?: number;
};

const CANCEL_BARS = [
  { height: "h-[42px]", threshold: 75, label: "> 75%" },
  { height: "h-[38px]", threshold: 50, label: "> 50%" },
  { height: "h-[28px]", threshold: 25, label: "> 25%" },
  { height: "h-[12px]", threshold: -1, label: "مستوى الخطر" },
];

export function CancellationRateChart({
  label = 0,
  className = "",
}: CancellationRateChartProps) {
  const { t } = useTranslation();
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);

  return (
    <div className={`flex items-end justify-center gap-8 ${className}`}>
      <div className="text-[32px] font-bold leading-none text-black">{label}%</div>
      <div className="flex h-[74px] items-end gap-2">
        {CANCEL_BARS.map((bar, i) => {
          const active = bar.threshold === -1 ? true : label > bar.threshold;
          return (
            <div
              key={i}
              className="relative"
              onMouseEnter={() => setHoveredBar(i)}
              onMouseLeave={() => setHoveredBar(null)}
            >
              {hoveredBar === i && (
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-md px-2.5 py-1.5 whitespace-nowrap z-30 pointer-events-none shadow-lg">
                  {bar.threshold === -1
                    ? t("dashboard.charts.cancellationDangerLevel")
                    : `${bar.label}: ${active ? t("dashboard.charts.cancellationBarHigh") : t("dashboard.charts.cancellationBarNormal")}`}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
              )}
              <span
                className={`block w-4 rounded-sm ${bar.height}`}
                style={{
                  background:
                    bar.threshold === -1
                      ? "#b91c1c"
                      : active
                      ? "oklch(50.5% 0.213 27.518)"
                      : "#f3f4f6",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* =========================
   3) On Time Delivery Gauge
========================= */

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type OnTimeGaugeChartProps = CommonProps & {
  value?: number;
  label?: string;
};

export function OnTimeGaugeChart({
  value = 0,
  label,
  className = "",
}: OnTimeGaugeChartProps) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);
  const safeValue = clamp(value ?? 0, 0, 100);

  const cx = 90;
  const cy = 90;
  const radius = 62;
  const needleAngle = 270 + (safeValue / 100) * 180;
  const needleEnd = polarToCartesian(cx, cy, radius - 14, needleAngle);

  return (
    <div className={`flex items-end justify-center gap-7 ${className}`}>
      <div className="text-[32px] font-bold leading-none text-black">
        {label ?? `${safeValue}%`}
      </div>
      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && <TooltipBubble text={t("dashboard.charts.onTimeTooltip", { value: label ?? `${safeValue}%` })} />}
        <svg width="130" height="95" viewBox="0 0 180 110">
          <path d={describeArc(cx, cy, radius, 270, 90)} fill="none" stroke="#df756c" strokeWidth="22" strokeLinecap="butt" />
          <path d={describeArc(cx, cy, radius, 72, 90)} fill="none" stroke="#008a53" strokeWidth="22" strokeLinecap="butt" />
          <line x1={cx} y1={cy} x2={needleEnd.x} y2={needleEnd.y} stroke="#006b43" strokeWidth="5" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="5" fill="#006b43" />
        </svg>
      </div>
    </div>
  );
}

/* =========================
   4) Completed Orders Sparkline
========================= */

type CompletedOrdersChartProps = CommonProps & {
  value?: string | number;
};

export function CompletedOrdersChart({
  value = 0,
  className = "",
}: CompletedOrdersChartProps) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);

  return (
    <div className={`flex items-end justify-between ps-3 gap-5 ${className}`}>
      <div className="text-[32px] font-bold leading-none text-black">{value}</div>
      <div
        className="relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && <TooltipBubble text={t("dashboard.charts.completedTooltip", { value })} />}
        <svg width="150" height="105" viewBox="0 0 150 105">
          <defs>
            <linearGradient id="completedGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#34c759" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#34c759" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 0 70 C 10 52, 18 48, 28 60 C 40 75, 58 55, 64 26 C 70 0, 86 6, 91 30 C 94 44, 105 30, 112 50 C 120 72, 137 40, 150 88 L 150 105 L 0 105 Z"
            fill="url(#completedGradient)"
          />
          <path
            d="M 0 70 C 10 52, 18 48, 28 60 C 40 75, 58 55, 64 26 C 70 0, 86 6, 91 30 C 94 44, 105 30, 112 50 C 120 72, 137 40, 150 88"
            fill="none" stroke="#25c335" strokeWidth="3" strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

/* =========================
   5) Courier Efficiency Ring
========================= */

type CourierEfficiencyChartProps = CommonProps & {
  value?: number;
};

export function CourierEfficiencyChart({
  value = 0,
  className = "",
}: CourierEfficiencyChartProps) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);
  const safeValue = Math.min(Math.max(value ?? 0, 0), 100);

  const size = 150;
  const center = size / 2;
  const radius = 54;
  const strokeWidth = 14;
  const dots = Array.from({ length: 60 });
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (safeValue / 100) * circumference;

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className="relative group transition-transform duration-300 hover:scale-105"
        style={{ width: size, height: size }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-30 pointer-events-none shadow-xl border border-gray-700 animate-in fade-in zoom-in duration-200">
            {t("dashboard.charts.efficiencyTooltip", { value: safeValue })}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-gray-900" />
          </div>
        )}
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="drop-shadow-sm">
          {/* Outer dotted ring */}
          {dots.map((_, index) => {
            const angle = (index / dots.length) * 360;
            const isFilled = (index / dots.length) * 100 <= safeValue;
            const inner = polarToCartesian(center, center, radius + 10, angle);
            const outer = polarToCartesian(center, center, radius + 14, angle);
            return (
              <line
                key={index}
                x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y}
                stroke={isFilled ? "#F39C12" : "#E0E0E0"}
                strokeWidth="1.5"
                strokeLinecap="round"
                className="transition-colors duration-500"
              />
            );
          })}
          {/* Background track */}
          <circle 
            cx={center} cy={center} r={radius} 
            fill="none" stroke="#FDF2E9" strokeWidth={strokeWidth} 
          />
          {/* Progress track */}
          <circle
            cx={center} cy={center} r={radius}
            fill="none" stroke="#E67E22" strokeWidth={strokeWidth}
            strokeLinecap="round" 
            strokeDasharray={circumference} 
            strokeDashoffset={dashOffset}
            transform={`rotate(-90 ${center} ${center})`}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[32px] font-black text-slate-900 leading-none">
            {safeValue}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            %
          </span>
        </div>
      </div>
    </div>
  );
}

/* =========================
   6) Shipment Attendance Line
========================= */

type ShipmentAttendanceChartProps = CommonProps & {
  label?: string;
};

export function ShipmentAttendanceChart({
  label = "0%",
  className = "",
}: ShipmentAttendanceChartProps) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);

  return (
    <div className={`flex items-center justify-between gap-4 ps-2 ${className}`}>
      <div className="text-[32px] font-black text-slate-900 leading-none shrink-0">{label}</div>
      <div
        className="relative flex-1 flex "
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered && (
          <div className="absolute -top-10 right-0 bg-slate-900 text-white text-[10px] font-bold rounded-lg px-2.5 py-1.5 whitespace-nowrap z-30 pointer-events-none shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-1 duration-200">
            {t("dashboard.charts.attendanceTooltip", { value: label })}
            <div className="absolute top-full right-4 border-[5px] border-transparent border-t-slate-900" />
          </div>
        )}
        <svg width="130" height="70" viewBox="0 0 150 100" preserveAspectRatio="xMaxYMid meet">
          <defs>
            <linearGradient id="shipmentGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M 0 80 Q 20 20, 40 50 T 80 30 T 120 60 T 150 20 L 150 100 L 0 100 Z"
            fill="url(#shipmentGradient)"
          />
          <path
            d="M 0 80 Q 20 20, 40 50 T 80 30 T 120 60 T 150 20"
            fill="none" stroke="#2563EB" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
          />
          {/* Animated pulse dot at end */}
          <circle cx="150" cy="20" r="4" fill="#2563EB">
            <animate attributeName="r" values="3;5;3" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
    </div>
  );
}

/* =========================
   7) Orders Per Hour Bar Chart
========================= */

const FALLBACK_BARS: HourlyOrder[] = [
  { hour: "8ص",  value: 8  },
  { hour: "9ص",  value: 14 },
  { hour: "10ص", value: 10 },
  { hour: "11ص", value: 12 },
  { hour: "12م", value: 18 },
  { hour: "1م",  value: 22 },
  { hour: "2م",  value: 20 },
  { hour: "3م",  value: 16 },
  { hour: "4م",  value: 14 },
  { hour: "5م",  value: 17 },
  { hour: "6م",  value: 13 },
];

type OrdersPerHourChartProps = CommonProps & {
  targetLabel?: string; // falls back to t("dashboard.charts.ordersTarget") if omitted
  targetValue?: number;
  data?: HourlyOrder[];
};

export function OrdersPerHourChart({
  targetLabel,
  targetValue = 20,
  data,
  className = "",
}: OrdersPerHourChartProps) {
  const { t } = useTranslation();
  const [tooltip, setTooltip] = useState<{ index: number; value: number; label: string } | null>(null);
  const resolvedTargetLabel = targetLabel ?? t("dashboard.charts.ordersTarget");

  const bars = data && data.length > 0 ? data : FALLBACK_BARS;
  const maxBarHeight = 90;
  const maxValue = Math.max(targetValue, ...bars.map((b) => b.value), 1);

  return (
    <div className={`relative h-[165px] w-full px-4 pt-5 overflow-visible ${className}`}>
      <div className="absolute left-6 right-6 top-[52px] border-t-2 border-dashed border-emerald-300" />
      <div className="absolute left-4 top-[35px] z-10 rounded-lg bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700">
        {resolvedTargetLabel}
      </div>

      <div className="flex h-full items-end justify-between gap-3">
        {bars.map((bar, i) => {
          const height = Math.max(4, Math.round((bar.value / maxValue) * maxBarHeight));
          const isAboveTarget = bar.value >= targetValue;
          const barColor = isAboveTarget ? "bg-emerald-500" : "bg-blue-500";

          return (
            <div
              key={bar.hour}
              className="relative flex flex-1 flex-col items-center"
              onMouseEnter={() => setTooltip({ index: i, value: bar.value, label: bar.hour })}
              onMouseLeave={() => setTooltip(null)}
            >
              {tooltip?.index === i && (
                <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-md px-2.5 py-1.5 whitespace-nowrap z-30 pointer-events-none shadow-lg">
                  {t("dashboard.charts.ordersPerHourTooltip", { hour: bar.hour, value: bar.value })}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                </div>
              )}
              <div
                className={`w-full max-w-[34px] rounded-t-lg cursor-pointer transition-opacity hover:opacity-75 ${barColor}`}
                style={{ height: `${height}px` }}
              />
              <span className="mt-2 text-[11px] font-semibold text-slate-700">{bar.hour}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
