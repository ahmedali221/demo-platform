import React, { useState } from "react";
import { useTranslation } from "react-i18next";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none",
        checked ? "bg-[#2E75B6]" : "bg-gray-200",
      ].join(" ")}
    >
      <span
        className={[
          "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform duration-200",
          checked ? "translate-x-5" : "translate-x-0",
        ].join(" ")}
      />
    </button>
  );
}

export default function TwoFactorSection() {
  const { t } = useTranslation();
  const [twoFaEnabled, setTwoFaEnabled] = useState(false);
  const [smsEnabled, setSmsEnabled] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm  overflow-hidden">
      <div className="flex items-center  gap-2 px-6 py-4 bg-gray-50/70 border-b border-gray-100">
        <h2 className="text-sm font-semibold text-gray-700">{t("settings.twoFactor")}</h2>
      </div>

      <div className="flex flex-col gap-5 p-6">
        {/* Enable 2FA */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5  flex-1">
            <span className="text-sm font-semibold text-gray-800">
              {t("settings.enable2fa")}
            </span>
            <span className="text-xs text-gray-500 leading-relaxed">
              {t("settings.enable2faDesc")}
            </span>
          </div>
                    <Toggle checked={twoFaEnabled} onChange={setTwoFaEnabled} />

        </div>

        <div className="border-t border-gray-100" />

        {/* SMS verification */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5  flex-1">
            <span className="text-sm font-semibold text-gray-800">
              {t("settings.smsVerification")}
            </span>
            <span className="text-xs text-gray-500 leading-relaxed">
              {t("settings.smsVerificationDesc")}
            </span>
          </div>
                    <Toggle checked={smsEnabled} onChange={setSmsEnabled} />

        </div>
      </div>
    </div>
  );
}
