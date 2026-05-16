import React from "react";

export interface StrategyCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  accentColor: string;
  badge?: { label: string; variant: "green" | "yellow" | "red" | "gray" };
}

const badgeStyles = {
  green:  { bg: "rgba(39,174,96,0.15)",  text: "#27AE60", ring: "#27AE60" },
  yellow: { bg: "rgba(210,169,71,0.15)", text: "#D2A947", ring: "#D2A947" },
  red:    { bg: "rgba(239,68,68,0.15)",  text: "#EF4444", ring: "#EF4444" },
  gray:   { bg: "#F3F4F6",              text: "#6B7280", ring: "#D1D5DB" },
};

export default function StrategyCard({ title, description, icon, accentColor, badge }: StrategyCardProps) {
  return (
    <div
      className="w-full flex flex-col gap-3 p-4 rounded-2xl bg-white shadow-[2px_4px_8px_rgba(0,0,0,0.10)] overflow-hidden"
      style={{ borderRight: `5px solid ${accentColor}` }}
    >
      {/* Top row: icon left, badge right */}
      <div className="flex items-center justify-between">
        <span style={{ color: accentColor }}>{icon}</span>
        {badge && (
          <span
            className="text-[11px] font-bold px-3 py-1 rounded-full whitespace-nowrap"
            style={{
              background: badgeStyles[badge.variant].bg,
              color: badgeStyles[badge.variant].text,
              outline: `1px solid ${badgeStyles[badge.variant].ring}`,
            }}
          >
            {badge.label}
          </span>
        )}
      </div>

      {/* Bottom: value + label */}
      <div className="flex flex-col gap-0.5">
        <h3 className="text-black text-xl font-bold leading-tight">{title}</h3>
        <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
