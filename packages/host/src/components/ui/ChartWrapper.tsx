import React, { ReactNode } from "react";

const ChartWrapper = ({
  icon,
  className,
  title,
  color,
  bgColor,
  status,
  children,
}: {
  icon: React.ReactNode;
  className?: string;
  title: string;
  color: string;
  bgColor: string;
  status?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={`rounded-2xl bg-white border border-t-4 border-[#d6d6d6] shadow-2xl min-h-36 pt-4 pb-6 flex flex-col justify-between gap-6 ${className}`}
      style={{ borderTopColor: color }}
    >
      <div className="flex justify-between items-center gap-2 px-3">
        <div className="flex gap-2 items-center min-w-0">
          {icon}
          <h4 className="text-sm font-bold truncate">{title}</h4>
        </div>
        {status && (
          <div
            style={{
              background: bgColor,
              color: color,
              border: `1px solid ${color}`,
            }}
            className={`py-1 px-2 rounded-full border text-sm flex items-center font-bold whitespace-nowrap flex-shrink-0`}
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
