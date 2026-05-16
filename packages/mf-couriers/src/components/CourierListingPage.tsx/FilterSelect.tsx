import React from "react";
import { ChevronDown } from "lucide-react";

type Option = {
  label: string;
  value: string | number | null;
};

interface FilterSelectProps {
  value: string | number | null;
  options: Option[];
  onChange: (value: string | null) => void;
  className?: string;
}

const FilterSelect = ({
  value,
  options,
  onChange,
  className = "",
}: FilterSelectProps) => {
  return (
    <div className={`relative inline-block ${className}`} dir="rtl">
      <select
        value={value ?? ""}
        onChange={(e) => {
          const raw = e.target.value;
          onChange(raw === "" ? null : raw);
        }}
        className="
          h-11 min-w-[110px]
          appearance-none
          rounded-xl
          border border-[#CFCFCF]
          bg-[#FAFAFA]
          px-10 pr-4
          text-sm font-medium text-[#333]
          outline-none
          transition
          hover:bg-white
          focus:border-[#BDBDBD]
          focus:ring-2 focus:ring-[#EAEAEA]
          cursor-pointer
        "
      >
        {options.map((option) => (
          <option
            key={String(option.value)}
            value={option.value ?? ""}
          >
            {option.label}
          </option>
        ))}
      </select>

      <ChevronDown
        size={16}
        className="
          pointer-events-none
          absolute left-3 top-1/2 -translate-y-1/2
          text-[#666]
        "
      />
    </div>
  );
};

export default FilterSelect;
