import React from "react";

// ── Badge ──────────────────────────────────────────────────────────────────

export type BadgeVariant = "green" | "yellow" | "gray";

export interface BadgeConfig {
  label: string;
  variant: BadgeVariant;
}

const SparkleIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    className="shrink-0"
  >
    <path d="M12 2 L13.5 9 L20 10.5 L13.5 12 L12 19 L10.5 12 L4 10.5 L10.5 9 Z" />
  </svg>
);

function Badge({ config }: { config: BadgeConfig }) {
  if (config.variant === "green") {
    return (
      <div className="inline-flex items-center justify-center px-3 py-[3px] rounded-full whitespace-nowrap bg-[rgba(39,174,96,0.25)] ring-1 ring-inset ring-[#27AE60]">
        <span className="text-[11px] font-bold text-[#27AE60] font-arabic">
          {config.label}
        </span>
      </div>
    );
  }

  if (config.variant === "yellow") {
    return (
      <div className="inline-flex items-center justify-center gap-1.5 px-3 py-[5px] rounded-full whitespace-nowrap bg-[rgba(251,188,5,0.15)] shadow-[0px_2px_2px_rgba(0,0,0,0.20)] ring-1 ring-inset ring-[#FBBC05]">
        <span className="text-[11px] font-bold text-[#FBBC05] font-arabic">
          {config.label}
        </span>
        <SparkleIcon />
      </div>
    );
  }

  return (
    <div className="inline-flex items-center justify-center px-3 py-[3px] rounded-full whitespace-nowrap ring-1 ring-inset ring-gray-200">
      <span className="text-[11px] font-bold text-gray-400 font-arabic">
        {config.label}
      </span>
    </div>
  );
}

// ── StrategyCard ───────────────────────────────────────────────────────────

export interface StrategyCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  badges?: BadgeConfig[];
  /** Controls the thick right-side accent border color */
  accentColor: string;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export default function StrategyCard({
  title,
  description,
  icon,
  badges = [],
  accentColor,
  active = false,
  disabled = false,
  onClick,
}: StrategyCardProps) {
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      style={{
        borderInlineEnd: `6px solid ${active ? accentColor : '#E5E7EB'}`,
      }}
      className={[
        "w-full flex flex-col gap-[18px] p-4 rounded-2xl bg-white overflow-hidden text-start",
        "shadow-[2px_4px_8px_rgba(0,0,0,0.25)]",
        "border-0",
        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        "transition-all duration-200",
      ].join(" ")}
    >
      {/* ── Text ── */}
      <div className="flex flex-col gap-2 w-full">
        <h3 className="text-xl font-bold text-gray-900 font-arabic m-0 leading-snug text-start">
          {title}
        </h3>
        <p className="text-sm text-gray-500 leading-loose font-arabic m-0 text-start">
          {description}
        </p>
      </div>

      {/* ── Bottom row: badges (right/start in RTL) + icon (left/end in RTL) ── */}
      <div className="flex items-center justify-between w-full">
        <span
          className="shrink-0 text-gray-300"
          style={{ color: active ? accentColor : undefined }}
        >
          {icon}
        </span>

        <div className="flex items-center gap-2.5">
          {badges.map((b) => (
            <Badge key={b.variant} config={b} />
          ))}
        </div>
      </div>
    </button>
  );
}
