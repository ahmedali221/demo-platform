import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

interface Props {
  courierId?: string;
  onAddAnother: () => void;
  onClose: () => void;
}

const SuccessScreen: React.FC<Props> = ({ onAddAnother, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center py-10 gap-6 text-center">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-50">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-lg font-bold text-gray-800">{t("courier.add.successTitle")}</p>
        <p className="text-sm text-gray-500">{t("courier.add.successSubtitle")}</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
        <button
          onClick={onAddAnother}
          className="flex-1 border border-brand text-brand rounded-xl py-2 px-4 text-sm font-semibold hover:bg-brand/5 transition-colors"
        >
          {t("courier.add.addAnother")}
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-brand text-white rounded-xl py-2 px-4 text-sm font-semibold hover:bg-brand/90 transition-colors"
        >
          {t("courier.add.goToProfile")}
        </button>
      </div>
    </div>
  );
};

export default SuccessScreen;
