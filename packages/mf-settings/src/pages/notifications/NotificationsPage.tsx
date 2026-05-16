import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Breadcrumb from "../../shared/Breadcrumb";
import "../../lib/i18n";
import "../../index.css";
import {
  type NotificationSettings,
  getNotifications,
  updateNotifications,
} from "./notifications.service";


// ── Switch ──────────────────────────────────────────────────────────────────

interface SwitchProps {
  checked: boolean;
  onChange: () => void;
}

function Switch({ checked, onChange }: SwitchProps) {
  return (
    // dir="ltr" forces the thumb to always slide left→right regardless of page RTL
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      dir="ltr"
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2E75B6] focus-visible:ring-offset-2 ${
        checked ? "bg-[#2E75B6]" : "bg-neutral-200"
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-[0px_2px_8px_0px_rgba(0,0,0,0.16)] transition-transform duration-200 ease-in-out ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ── Toggle Row ──────────────────────────────────────────────────────────────

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="self-stretch p-3 bg-white rounded-xl border border-neutral-200 flex justify-between items-center">
      <div className="flex flex-col items-start gap-1.5">
        <span className="text-black text-base font-extrabold font-['Cairo'] leading-6">
          {label}
        </span>
        <span className="text-gray-400 text-xs font-normal font-['Cairo']">
          {description}
        </span>
      </div>
      <Switch checked={checked} onChange={onChange} />
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: NotificationSettings = {
  inApp: true,
  email: true,
  sms: true,
  thresholdExceeded: true,
  commitmentRateDrop: true,
  courierAutoDeactivation: true,
  importSuccess: true,
  fileProcessingFailure: true,
  weeklyReportReady: true,
  slaReviewReminder: true,
};

export default function NotificationsPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getNotifications()
      .then(({ data }) => setSettings(data))
      .catch(() => setError(t("notifications.errorLoad")))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (key: keyof NotificationSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    updateNotifications(updated).catch(() => {
      // revert on failure
      setSettings(settings);
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center gap-2 text-sm text-gray-400">
        <span className="w-4 h-4 border-2 border-gray-200 border-t-[#2E75B6] rounded-full animate-spin" />
        {t("activity.loading")}
      </div>
    );
  }

  return (
    <div className="p-6 mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      {/* ── Breadcrumb / back ── */}
      <div className="flex items-center justify-between mb-6">
        <Breadcrumb pageTitleKey="notifications.pageTitle" />
      </div>

      {/* ── Page title ── */}
      <div className="text mb-6">
        <h1 className="text-xl font-bold text-gray-800">
          {t("notifications.heading")}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          {t("notifications.subheading")}
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-['Cairo']">
          {error}
        </div>
      )}

      {/* ── Card 1: Channels ── */}
      <div className="p-6 bg-white rounded-2xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col  gap-6 overflow-hidden mb-4">
        <div className="inline-flex  items-center gap-2">
          <span className=" text-zinc-900 text-xl font-bold font-['Cairo'] leading-7">
            {t("notifications.channelsTitle")}
          </span>
        </div>
        <div className="self-stretch flex flex-col gap-4">
          <ToggleRow
            label={t("notifications.inApp")}
            description={t("notifications.inAppDesc")}
            checked={settings.inApp}
            onChange={() => toggle("inApp")}
          />
          <ToggleRow
            label={t("notifications.email")}
            description={t("notifications.emailDesc")}
            checked={settings.email}
            onChange={() => toggle("email")}
          />
          <ToggleRow
            label={t("notifications.sms")}
            description={t("notifications.smsDesc")}
            checked={settings.sms}
            onChange={() => toggle("sms")}
          />
        </div>
      </div>

      {/* ── Card 2: Events ── */}
      <div className="p-6 bg-white rounded-2xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col  gap-4 overflow-hidden">

        {/* Section 1: Couriers */}
        <div className="h-14 flex flex-col justify-center ">
          <span className=" text-zinc-900 text-base font-bold font-['Cairo'] leading-7">
            {t("notifications.couriersSubtitle")}
          </span>
          <span className=" text-zinc-900 text-xl font-bold font-['Cairo'] leading-7">
            {t("notifications.channelsTitle")}
          </span>
        </div>
        <div className="self-stretch flex flex-col gap-4">
          <ToggleRow
            label={t("notifications.warningThreshold")}
            description={t("notifications.warningThresholdDesc")}
            checked={settings.thresholdExceeded}
            onChange={() => toggle("thresholdExceeded")}
          />
          <ToggleRow
            label={t("notifications.commitmentDrop")}
            description={t("notifications.commitmentDropDesc")}
            checked={settings.commitmentRateDrop}
            onChange={() => toggle("commitmentRateDrop")}
          />
          <ToggleRow
            label={t("notifications.autoDeactivate")}
            description={t("notifications.autoDeactivateDesc")}
            checked={settings.courierAutoDeactivation}
            onChange={() => toggle("courierAutoDeactivation")}
          />
        </div>

        {/* Section 2: Data Import */}
        <div className="inline-flex  items-center gap-2">
          <span className=" text-zinc-900 text-base font-bold font-['Cairo'] leading-7">
            {t("notifications.dataImportTitle")}
          </span>
        </div>
        <div className="self-stretch flex flex-col gap-4">
          <ToggleRow
            label={t("notifications.importSuccess")}
            description={t("notifications.importSuccessDesc")}
            checked={settings.importSuccess}
            onChange={() => toggle("importSuccess")}
          />
          <ToggleRow
            label={t("notifications.importFailure")}
            description={t("notifications.importFailureDesc")}
            checked={settings.fileProcessingFailure}
            onChange={() => toggle("fileProcessingFailure")}
          />
        </div>

        {/* Section 3: Reports & Schedules */}
        <div className="inline-flex  items-center gap-2">
          <span className=" text-zinc-900 text-base font-bold font-['Cairo'] leading-7">
            {t("notifications.reportsTitle")}
          </span>
        </div>
        <div className="self-stretch flex flex-col gap-4">
          <ToggleRow
            label={t("notifications.weeklyReport")}
            description={t("notifications.weeklyReportDesc")}
            checked={settings.weeklyReportReady}
            onChange={() => toggle("weeklyReportReady")}
          />
          <ToggleRow
            label={t("notifications.slaReminder")}
            description={t("notifications.slaReminderDesc")}
            checked={settings.slaReviewReminder}
            onChange={() => toggle("slaReviewReminder")}
          />
        </div>
      </div>
    </div>
  );
}
