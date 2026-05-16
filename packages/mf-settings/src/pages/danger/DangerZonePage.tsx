import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { AlertTriangle, Trash2, PowerOff } from "lucide-react";
import Breadcrumb from "../../shared/Breadcrumb";
import "../../lib/i18n";
import "../../index.css";
import { deactivateAccount, deleteAccount } from "./danger.service";

type ConfirmModal = "deactivate" | "delete" | null;

export default function DangerZonePage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [confirmModal, setConfirmModal] = useState<ConfirmModal>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!confirmModal) return;
    setSubmitting(true);
    setActionError(null);
    try {
      if (confirmModal === "deactivate") {
        await deactivateAccount();
      } else {
        await deleteAccount();
      }
      window.location.href = "/login";
    } catch {
      setActionError(t("danger.actionError"));
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      {/* ── Breadcrumb / back ── */}
      <div className="flex items-center justify-between mb-6">
        <Breadcrumb pageTitleKey="team.tabDanger" />
      </div>

      {/* ── Page title ── */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">{t("team.tabDanger")}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{t("team.dangerWarningDesc")}</p>
      </div>

      <div className="flex flex-col gap-4">
        {/* Warning banner */}
        <div className="flex items-center gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl">
          <div className="flex flex-col  flex-1">
            <span className="text-sm font-bold text-red-700 font-['Cairo']">{t("team.dangerWarning")}</span>
            <span className="text-xs text-red-400 font-['Cairo']">{t("team.dangerWarningDesc")}</span>
          </div>
          <AlertTriangle size={22} className="text-orange-500 shrink-0" />
        </div>

        {/* Data management */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="flex items-center  px-6 py-4 border-b border-red-100">
            <h2 className="text-base font-bold text-red-600 font-['Cairo']">{t("team.dataManagement")}</h2>
          </div>
          <div className="divide-y divide-red-50">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex flex-col  gap-0.5">
                <span className="text-sm font-semibold text-gray-800 font-['Cairo']">{t("team.clearCacheTitle")}</span>
                <span className="text-xs text-gray-400 font-['Cairo']">{t("team.clearCacheDesc")}</span>
              </div>
              <button className="px-4 py-1.5 text-xs font-semibold rounded-full border border-red-300 text-red-500 hover:bg-red-50 transition-colors font-['Cairo']">
                {t("team.clearCache")}
              </button>
            </div>
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex flex-col  gap-0.5">
                <span className="text-sm font-semibold text-gray-800 font-['Cairo']">{t("team.deleteOldTitle")}</span>
                <span className="text-xs text-gray-400 font-['Cairo']">{t("team.deleteOldDesc")}</span>
              </div>
              <button className="px-4 py-1.5 text-xs font-semibold rounded-full border border-red-300 text-red-500 hover:bg-red-50 transition-colors font-['Cairo']">
                {t("team.deleteOld")}
              </button>
            </div>
          </div>
        </div>

        {/* Account actions */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="flex items-center  px-6 py-4 border-b border-red-100">
            <h2 className="text-base font-bold text-red-600 font-['Cairo']">{t("team.deleteAccountTitle")}</h2>
          </div>
          <div className="divide-y divide-red-50">
            {/* Deactivate account */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex flex-col  gap-0.5">
                <span className="text-sm font-semibold text-gray-800 font-['Cairo']">{t("danger.deactivateTitle")}</span>
                <span className="text-xs text-gray-400 font-['Cairo']">{t("danger.deactivateDesc")}</span>
              </div>
              <button
                onClick={() => setConfirmModal("deactivate")}
                className="flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full border border-red-300 text-red-500 hover:bg-red-50 transition-colors font-['Cairo']"
              >
                <PowerOff size={13} />
                {t("danger.deactivateBtn")}
              </button>
            </div>
            {/* Delete account */}
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex flex-col  gap-0.5">
                <span className="text-sm font-semibold text-gray-800 font-['Cairo']">{t("team.deleteOrgTitle")}</span>
                <span className="text-xs text-gray-400 font-['Cairo']">{t("team.deleteOrgDesc")}</span>
              </div>
              <button
                onClick={() => setConfirmModal("delete")}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors font-['Cairo']"
              >
                <Trash2 size={14} />
                {t("team.deleteAccountBtn")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Confirmation Modal ── */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4"
            dir={isRtl ? "rtl" : "ltr"}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 font-['Cairo']">
                  {confirmModal === "deactivate"
                    ? t("danger.confirmDeactivateTitle")
                    : t("danger.confirmDeleteTitle")}
                </p>
                <p className="text-xs text-gray-400 font-['Cairo'] mt-0.5">
                  {confirmModal === "deactivate"
                    ? t("danger.confirmDeactivateDesc")
                    : t("danger.confirmDeleteDesc")}
                </p>
              </div>
            </div>

            {actionError && (
              <p className="text-xs text-red-500 font-['Cairo']">{actionError}</p>
            )}

            <div className="flex gap-3 ">
              <button
                onClick={() => { setConfirmModal(null); setActionError(null); }}
                disabled={submitting}
                className="px-4 py-2 text-sm font-semibold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors font-['Cairo'] disabled:opacity-50"
              >
                {t("settings.cancel")}
              </button>
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-red-600 text-white hover:bg-red-700 transition-colors font-['Cairo'] disabled:opacity-50"
              >
                {submitting && (
                  <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                )}
                {t("danger.confirmBtn")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
