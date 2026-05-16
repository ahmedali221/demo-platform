import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { changePassword } from "../security.service";

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

interface PasswordField {
  value: string;
  show: boolean;
}

export default function ChangePasswordSection() {
  const { t } = useTranslation();

  const [current, setCurrent] = useState<PasswordField>({ value: "", show: false });
  const [newPwd, setNewPwd] = useState<PasswordField>({ value: "", show: false });
  const [confirm, setConfirm] = useState<PasswordField>({ value: "", show: false });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setFieldErrors({});

    if (newPwd.value !== confirm.value) {
      setError(t("settings.passwordsDoNotMatch"));
      return;
    }

    setLoading(true);
    try {
      await changePassword({
        currentPassword: current.value,
        newPassword: newPwd.value,
        confirmPassword: confirm.value,
      });
      setSuccess(true);
      setCurrent({ value: "", show: false });
      setNewPwd({ value: "", show: false });
      setConfirm({ value: "", show: false });
    } catch (err: any) {
      const response = err.response?.data;
      if (response?.errors) {
        setFieldErrors(response.errors);
      } else if (response?.message) {
        setError(response.message);
      } else {
        setError(t("settings.genericError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-full overflow-hidden">
      <div className="flex items-center  gap-2 px-6 py-4 bg-gray-50/70 border-b border-gray-100">
        <span className="w-1 h-4 rounded-full bg-[#2E75B6]" />
        <h2 className="text-sm font-semibold text-gray-700">{t("settings.changePassword")}</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
        {success && (
          <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-100 rounded-xl">
            {t("settings.passwordUpdatedSuccessfully")}
          </div>
        )}

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
            {error}
          </div>
        )}

        {/* Current password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-600">{t("settings.currentPassword")}</label>
          <div className="relative">
            <input
              type={current.show ? "text" : "password"}
              value={current.value}
              onChange={e => setCurrent(p => ({ ...p, value: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2E75B6] focus:ring-2 focus:ring-blue-50 transition-all pe-10 bg-white hover:border-gray-300"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setCurrent(p => ({ ...p, show: !p.show }))}
              className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {current.show ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        {/* New password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-600">{t("settings.newPassword")} *</label>
          <div className="relative">
            <input
              type={newPwd.show ? "text" : "password"}
              value={newPwd.value}
              onChange={e => setNewPwd(p => ({ ...p, value: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2E75B6] focus:ring-2 focus:ring-blue-50 transition-all pe-10 bg-white hover:border-gray-300"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setNewPwd(p => ({ ...p, show: !p.show }))}
              className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {newPwd.show ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {fieldErrors.NewPassword && (
            <p className="text-xs text-red-500 mt-1">{fieldErrors.NewPassword[0]}</p>
          )}
          <p className="text-xs text-gray-400">{t("settings.newPasswordHint")}</p>
        </div>

        {/* Confirm password */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-600">{t("settings.confirmPassword")} *</label>
          <div className="relative">
            <input
              type={confirm.show ? "text" : "password"}
              value={confirm.value}
              onChange={e => setConfirm(p => ({ ...p, value: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2E75B6] focus:ring-2 focus:ring-blue-50 transition-all pe-10 bg-white hover:border-gray-300"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setConfirm(p => ({ ...p, show: !p.show }))}
              className="absolute inset-y-0 end-0 flex items-center pe-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {confirm.show ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          <p className="text-xs text-gray-400">{t("settings.confirmPasswordHint")}</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-1 py-2.5 text-sm font-semibold bg-[#2E75B6] text-white rounded-xl hover:bg-[#245E91] shadow-sm hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t("common.processing")}
            </>
          ) : (
            t("settings.updatePassword")
          )}
        </button>
      </form>
    </div>
  );
}
