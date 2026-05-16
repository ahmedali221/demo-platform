import React from "react";
import { useTranslation } from "react-i18next";
import successSvg from "../../assets/onsuccess.svg";

interface Props {
  courierName: string;
  courierId: string;
  onBackToList: () => void;
  onViewProfile: () => void;
}

const SuccessModal: React.FC<Props> = ({
  courierName,
  courierId,
  onBackToList,
  onViewProfile,
}) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="w-[567px] p-8 bg-white rounded-2xl shadow-[2px_4px_8px_0px_rgba(0,0,0,0.25)] flex flex-col items-center gap-6">
        <div className="w-48 h-36 flex items-center justify-center">
          <img src={successSvg} alt="" className="h-full object-contain" />
        </div>

        <div className="flex flex-col items-center gap-2 text-center">
          <p className="text-black text-xl font-bold font-['Cairo'] leading-8 tracking-wide">
            {t("courier.add.successTitle")}
          </p>
          <p className="text-base font-['Cairo'] leading-7">
            <span className="text-neutral-400">
              {t("courier.add.successMessage", { name: courierName })}
            </span>
          </p>
          {courierId && (
            <p className="text-lg font-['Cairo'] leading-7">
              <span className="text-neutral-400">
                {t("courier.add.courierId")}{" "}
              </span>
              <span className="text-black font-bold">{courierId}</span>
            </p>
          )}
        </div>

        <div className="self-stretch flex justify-center gap-4">
          <button
            type="button"
            onClick={onViewProfile}
            className="w-48 py-4 px-3 text-nowrap bg-slate-800/5 rounded-xl outline outline-1 outline-offset-[-1px] outline-blue-900 text-blue-900 text-base font-bold font-['Cairo'] leading-7 hover:bg-blue-50 transition-colors"
          >
            {t("courier.add.viewProfile")}
          </button>
          <button
            type="button"
            onClick={onBackToList}
            className="w-72 py-4 bg-[#27AE60] rounded-xl text-white text-xl font-bold font-['Cairo'] leading-7 shadow-[0px_10px_15px_-3px_rgba(20,83,45,0.20)] hover:bg-green-600 transition-colors"
          >
            {t("courier.add.backToList")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
