import React, { useEffect, useRef, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  label,
  options,
  value,
  onChange,
  placeholder,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <div
        onClick={() => setOpen((o) => !o)}
        className={`
          px-4 py-3 bg-neutral-100 rounded-xl outline outline-1 outline-offset-[-1px] cursor-pointer
          flex items-center justify-between gap-3
          ${open ? "outline-2 outline-indigo-600 bg-white" : "outline-neutral-200 hover:outline-indigo-200"}
        `}
      >
        {/* DOM order: [text, chevron] — text on leading side, chevron on trailing side in both LTR and RTL */}
        <span className="text-sm font-bold text-black font-['Cairo'] truncate flex-1">
          {selected ? selected.label : placeholder || label}
        </span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`transition-transform duration-150 flex-shrink-0 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="black"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Options panel */}
      {open && (
        <div className="absolute top-full mt-1 right-0 left-0 z-50 bg-white rounded-xl border border-indigo-200 overflow-hidden shadow-md">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`
                px-4 py-3 text-sm text-center cursor-pointer font-['Cairo'] transition-colors
                hover:bg-indigo-50
                ${value === opt.value ? "font-bold text-indigo-700 bg-indigo-50" : "text-neutral-800"}
              `}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
