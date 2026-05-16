import React from "react";
import { useTranslation } from "react-i18next";
type DetailsCardProps = {
  title: string;
  value?: string | number;
  goal?: { value: number; threshold: number };
  progress?: React.ReactNode;
  description?: string;
  color: string;
};

const DetailsCard = (props: DetailsCardProps) => {
  const { t } = useTranslation();
  return (
    <div className="py-4 px-6 bg-white border min-w-43 border-[#DFDFDF] rounded-xl shadow-sm shadow-[#00000040] flex flex-col items-center gap-1.5">
      <span className="text-sm text-[#B3B3B3]">{props.title}</span>
      <div className="flex flex-col gap-1 items-center w-full">
        <span className="text-xl font-bold" style={{ color: props.color }}>
          {props.value}
        </span>
        {props.goal && (
          <div className="flex flex-col gap-1 w-full py-2.5">
            <div className="flex justify-between">
              <p className="text-xs text-[#B3B3B3]">
                {t("courier.goal") + ": " + props.goal.threshold}
              </p>
              <p className="text-xs font-bold " style={{ color: props.color }}>
                {props.goal.value}%
              </p>
            </div>
            <div className="bg-[#ECEEF0] h-2 w-full rounded-full shadow-[inset_0_2px_5px_rgba(0,4,4,0.3)] overflow-hidden">
              <div
                className={` h-full shadow-[inset_0_2px_5px_rgba(0,4,4,0.3)] rounded-full`}
                style={{
                  width: `${props.goal.value}%`,
                  background: props.color,
                }}
              ></div>
            </div>
          </div>
        )}
        {props.description && (
          <span className="text-xs text-[#B3B3B3]">{props.description}</span>
        )}
      </div>
    </div>
  );
};

export default DetailsCard;
