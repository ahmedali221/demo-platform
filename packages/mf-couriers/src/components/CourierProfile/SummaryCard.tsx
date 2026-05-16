import React from "react";
import { useTranslation } from "react-i18next";

const SummaryCard = ({
  text,
  numberOfViolaionts,
  color,
}: {
  text: string;
  numberOfViolaionts: number;
  color?: string;
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex justify-between p-4 rounded-xl border border-[#B3B3B3] bg-[#DDDDDD66]">
      <span className="text-base font-semibold text-[#8A8A8A]">{text}</span>
      {numberOfViolaionts !== undefined && (
        <span className="text-base font-semibold " style={{ color: color }}>
          {numberOfViolaionts} {t("courier.once")}
        </span>
      )}
    </div>
  );
};

export default SummaryCard;
