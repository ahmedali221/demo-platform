import React from "react";

interface ReportTypeCardProps {
  title: string;
  description: string;
  selected: boolean;
  onSelect: () => void;
}

const FileIcon = () => (
  <svg width="22" height="26" viewBox="0 0 22 26" fill="none">
    <path
      d="M3 1h10l6 6v16a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2z"
      fill="#1e293b"
    />
    <path d="M13 1v6h6" stroke="#fff" strokeWidth="1.2" fill="none" />
    <path
      d="M5 13h10M5 17h7"
      stroke="#fff"
      strokeWidth="1"
      strokeLinecap="round"
    />
  </svg>
);

export const ReportTypeCard: React.FC<ReportTypeCardProps> = ({
  title,
  description,
  selected,
  onSelect,
}) => (
  <button
    onClick={onSelect}
    className={`
      w-full h-20 p-3 rounded-xl transition-all
      ${
        selected
          ? "bg-indigo-50 outline outline-2 outline-indigo-600"
          : "bg-neutral-100 outline outline-1 outline-neutral-200 hover:bg-neutral-50"
      }
    `}
  >
    {/*
      DOM order: [icon, text].
      justify-start is direction-aware:
        LTR → icon on far LEFT,  text to its right  (group sits at left edge)
        RTL → icon on far RIGHT, text to its left   (group sits at right edge)
    */}
    <div className="flex items-center gap-1.5 justify-start h-full">
      <div className="flex-shrink-0">
        <FileIcon />
      </div>
      {/*
        items-start aligns the text column to the flex cross-axis start.
        Text nodes inside naturally follow the inherited direction for alignment.
      */}
      <div className="flex flex-col items-start gap-[3px]">
        <div className="text-indigo-950 text-sm font-bold font-['Cairo'] leading-6">
          {title}
        </div>
        <div className="text-neutral-400 text-[10px] font-normal font-['Cairo'] leading-4">
          {description}
        </div>
      </div>
    </div>
  </button>
);
