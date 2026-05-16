import React from "react";
import redCircle from "../../assets/red-circle.svg";
import greyCircle from "../../assets/grey-circle.svg";
import tick from "../../assets/greenTicj.svg";
import yellowCircle from "../../assets/yellow-circle.svg";
import { useTranslation } from "react-i18next";
const ViolationCard = ({
  title,
  date,
  action,
  isResolved,
}: {
  title: string;
  date: string;
  action: string;
  isResolved: boolean;
}) => {
  const { t } = useTranslation();
  return (
    <div className="flex justify-between rounded-xl border border-[#DFDFDF] bg-[#F2F2F2] p-5">
      <div className="flex gap-4">
        <img src={isResolved ? greyCircle : redCircle} />
        <div className="flex flex-col gap-2">
          <p className="font-bold">{title}</p>
          <p className=" text-xs text-[#B3B3B3]">{date}</p>
        </div>
      </div>
      <div className="flex gap-3 items-center">
        <span
          style={
            isResolved
              ? { color: "black", background: "none", border: "none" }
              : {
                  color: "#EF4444",
                  background: "#EF44441A",
                  border: "1px solid #EF44444D",
                }
          }
          className="px-4 py-1 border rounded-md flex items-center text-sm font-bold"
        >
          {action}
        </span>
        <span
          className="px-4 py-1 border rounded-md flex items-center gap-2 text-sm font-bold"
          style={
            isResolved
              ? { color: "black", background: "none", border: "none" }
              : {
                  color: "#10B981",
                  background: "#10B9811A",
                  border: "1px solid #10B9814D",
                }
          }
        >
          {isResolved ? "" : <img src={tick} />}
          {t("courier.solved")}
        </span>
      </div>
    </div>
  );
};

export default ViolationCard;
