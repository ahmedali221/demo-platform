import React from "react";
import { useTranslation } from "react-i18next";

// riskLevel enum from API: 1=Green(آمن), 2=Yellow(يحتاج متابعة), 3=Red(خطر مرتفع)
export type StatusFilterValue = 1 | 2 | 3;

type FilterOption = {
  value?: StatusFilterValue;
  label: string;
  dotColor?: string;
};

interface StatusFilterTabsProps {
  value?: number;
  onChange: (value: StatusFilterValue | undefined) => void;
  options?: FilterOption[];
  className?: string;
}

const defaultOptions: FilterOption[] = [
  { value: undefined, label: "courier.all" },
  { value: 1, label: "courier.safe", dotColor: "#10B981" },
  { value: 2, label: "courier.warning", dotColor: "#F59E0B" },
  { value: 3, label: "courier.dangerLabel", dotColor: "#EF4444" },
];

const StatusFilterTabs: React.FC<StatusFilterTabsProps> = ({
  value,
  onChange,
  options = defaultOptions,
  className = "",
}) => {
  const { t } = useTranslation();
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-lg border border-[#B3B3B3] bg-white px-5 py-2 ${className}`}
    >
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() =>
              option.value != undefined
                ? onChange(option.value)
                : onChange(undefined)
            }
            className={[
              "inline-flex items-center gap-2 rounded-md border px-4 py-1.5 text-sm font-medium transition-colors",
              "min-w-[64px] justify-center",
              isActive
                ? " border-[#D2A947] bg-[#F59E0B1A]  text-[#D2A947]"
                : "border-[#D6D6D6] bg-[#F8F8F8] text-[#444] hover:bg-[#F2F2F2]",
            ].join(" ")}
          >
            {option.dotColor && (
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: option.dotColor }}
              />
            )}
            <span>{t(option.label)}</span>
          </button>
        );
      })}
    </div>
  );
};

export default StatusFilterTabs;
