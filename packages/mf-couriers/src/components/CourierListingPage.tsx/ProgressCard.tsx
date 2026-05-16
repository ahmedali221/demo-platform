import React from "react";
import { useTranslation } from "react-i18next";

interface ProgressCardProps {
  color: string;
  title: React.ReactNode;
  icon?: React.ReactNode;
  label?: string;
  labelColor?: string;
  labelBg?: string;
  description?: string;
  measurement?: string;
  goal?: { value: number | string | null | undefined; thershold?: number | string };
}

const ProgressCard = ({
  color,
  title,
  icon,
  label,
  labelColor,
  labelBg,
  description,
  measurement,
  goal,
}: ProgressCardProps) => {
  const { t } = useTranslation();

  const hasData =
    goal?.value !== null &&
    goal?.value !== undefined &&
    goal?.value !== "";

  const progress =
    hasData &&
    goal &&
    goal.thershold &&
    typeof goal.value == "number" &&
    typeof goal.thershold == "number" &&
    goal.thershold > 0
      ? Math.round((goal.value / 100) * 100)
      : 0;

  return (
    <div
      className="flex flex-col gap-4 px-6 py-6 border-s-[6px] bg-white rounded-2xl shadow-lg min-h-45"
      style={{ borderInlineStartColor: color }}
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex gap-3 items-center">
          {icon}
          <h2 className="text-black text-xl font-bold">{title}</h2>
        </div>
        {label && (
          <span
            style={{ background: labelBg, color: labelColor }}
            className={`text-xs font-black  px-2 py-1 rounded-full text-nowrap`}
          >
            {label}
          </span>
        )}
      </div>

      {goal && (
        hasData ? (
          <p className="text-[40px] font-bold leading-[44px]" style={{ color }}>
            {goal.value}
            {measurement}
          </p>
        ) : (
          <p className="text-2xl font-semibold text-[#B3B3B3]">
            {t("courier.noData")}
          </p>
        )
      )}

      {description && <p className="text-black text-sm">{description}</p>}

      {goal && hasData && (
        <div className="flex flex-col gap-1">
          {goal.thershold && (
            <p className="text-xs font-semibold text-[#B3B3B3]">
              {t("courier.goal")} : ≤ {goal.thershold}
              {measurement ? measurement : ""}
            </p>
          )}
          {typeof goal.value == "number" ? (
            <div className="bg-[#CECECE] rounded-full h-1.5 w-full overflow-hidden">
              <div
                className="h-1.5 rounded-full"
                style={{
                  width: `${progress}%`,
                  backgroundColor: color,
                }}
              />
            </div>
          ) : (
            ""
          )}
        </div>
      )}
    </div>
  );
};

export default ProgressCard;
