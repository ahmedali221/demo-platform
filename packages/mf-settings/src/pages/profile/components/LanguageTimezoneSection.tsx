import React from "react";
import { useTranslation } from "react-i18next";

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

interface FormData {
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
}

interface Props {
  form: FormData;
  onChange: (field: string, value: string) => void;
}

function SelectField({ label, value, onChange, options }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-600">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none appearance-none focus:border-[#2E75B6] focus:ring-2 focus:ring-blue-50 transition-all ps-9 bg-white cursor-pointer hover:border-gray-300"
        >
          {options.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-400 pointer-events-none">
          <ChevronDownIcon />
        </span>
      </div>
    </div>
  );
}

export default function LanguageTimezoneSection({ form, onChange }: Props) {
  const { t } = useTranslation();

  const languageOptions = [
    { value: "ar", label: t("settings.languages.ar") },
    { value: "en", label: t("settings.languages.en") },
  ];

  const timezoneOptions = [
    { value: "Asia/Riyadh", label: t("settings.timezones.riyadh") },
    { value: "Asia/Dubai", label: t("settings.timezones.dubai") },
    { value: "Africa/Cairo", label: t("settings.timezones.cairo") },
    { value: "Europe/London", label: t("settings.timezones.london") },
  ];

  const dateFormatOptions = [
    { value: "DD/MM/YYYY", label: t("settings.dateFormats.ddmmyyyy") },
    { value: "MM/DD/YYYY", label: t("settings.dateFormats.mmddyyyy") },
    { value: "YYYY/MM/DD", label: t("settings.dateFormats.yyyymmdd") },
  ];

  const timeFormatOptions = [
    { value: "12h", label: t("settings.timeFormats.12h") },
    { value: "24h", label: t("settings.timeFormats.24h") },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 bg-gray-50/70 border-b border-gray-100">
        <span className="w-1 h-4 rounded-full bg-[#2E75B6]" />
        <h2 className="text-sm font-semibold text-gray-700">{t("settings.langTimezone")}</h2>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SelectField
          label={t("settings.language")}
          value={form.language}
          onChange={v => onChange("language", v)}
          options={languageOptions}
        />
        <SelectField
          label={t("settings.timezone")}
          value={form.timezone}
          onChange={v => onChange("timezone", v)}
          options={timezoneOptions}
        />
        <SelectField
          label={t("settings.dateFormat")}
          value={form.dateFormat}
          onChange={v => onChange("dateFormat", v)}
          options={dateFormatOptions}
        />
        <SelectField
          label={t("settings.timeFormat")}
          value={form.timeFormat}
          onChange={v => onChange("timeFormat", v)}
          options={timeFormatOptions}
        />
      </div>
    </div>
  );
}
