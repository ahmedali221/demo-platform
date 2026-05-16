import React, { ReactNode } from "react";
const statusColors = {
  normal: "bg-[#EF444440] border-[#C0392B] text-[#C0392B]",
};
const ChartWrapper = ({
  icon,
  title,
  description,
  status,
  level,
  children,
}: {
  icon?: React.ReactNode;
  title?: string;
  description?: string;
  status?: string;
  level?: keyof typeof statusColors;
  children: React.ReactNode;
}) => {
  return (
    <div className="rounded-2xl bg-white border border-[#d6d6d6] shadow-xl py-4 px-3">
      <div className="flex justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex gap-2">
            {icon}
            <h4 className="text-sm font-bold">{title}</h4>
          </div>
          <span className="text-xs">{description}</span>
        </div>
        {status && (
          <div
            className={`py-1 px-2 rounded-full border text-sm ${level && statusColors[level]}  `}
          >
            {status}
          </div>
        )}
      </div>
      {children}
    </div>
  );
};

export default ChartWrapper;
