import React from "react";
import { useTranslation } from "react-i18next";

interface InfoCardProps {
  title: string;
  value: number | string;
  measurement?: React.ReactNode;
  color?: string;
}

const InfoCard = ({ title, value, measurement, color }: InfoCardProps) => {
  const { t } = useTranslation();
  return (
    <div className="bg-[#F7F7F7] w-full border border-[#B3B3B3] p-4 rounded-2xl shadow flex flex-col items-center">
      <p className="text-sm text-[#A2A2A2]">{t(title)}</p>
      <h3
        className="font-bold text-[#191C1E]"
        style={color ? { color } : undefined}
      >
        {value}
      </h3>
      <p className="text-sm text-[#A2A2A2]">{measurement}</p>
    </div>
  );
};

export default InfoCard;
