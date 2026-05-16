import React from "react";
import { useTranslation } from "react-i18next";

const PencilIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  bio: string;
}

interface Props {
  form: FormData;
  onChange: (field: string, value: string) => void;
}

function FieldInput({ label, value, onChange, required, type = "text" }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-600">
        {label}{required && " *"}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2E75B6] focus:ring-2 focus:ring-blue-50 transition-all ps-9 bg-white hover:border-gray-300"
        />
        <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-gray-300 pointer-events-none">
          <PencilIcon />
        </span>
      </div>
    </div>
  );
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
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none appearance-none focus:border-[#2E75B6] focus:ring-2 focus:ring-blue-50 transition-all pe-9 bg-white cursor-pointer hover:border-gray-300"
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

export default function PersonalInfoSection({ form, onChange }: Props) {
  const { t } = useTranslation();

  const departmentOptions = [
    { value: "operations", label: t("settings.departments.operations") },
    { value: "hr", label: t("settings.departments.hr") },
    { value: "finance", label: t("settings.departments.finance") },
    { value: "it", label: t("settings.departments.it") },
    { value: "marketing", label: t("settings.departments.marketing") },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
      <div className="flex items-center gap-2 px-6 py-4 bg-gray-50/70 border-b border-gray-100">
        <span className="w-1 h-4 rounded-full bg-[#2E75B6]" />
        <h2 className="text-sm font-semibold text-gray-700">{t("settings.personalInfo")}</h2>
      </div>

      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FieldInput
          label={t("settings.firstName")}
          value={form.firstName}
          onChange={v => onChange("firstName", v)}
          required
        />
        <FieldInput
          label={t("settings.lastName")}
          value={form.lastName}
          onChange={v => onChange("lastName", v)}
          required
        />
        <FieldInput
          label={t("settings.email")}
          value={form.email}
          onChange={v => onChange("email", v)}
          required
          type="email"
        />
        <FieldInput
          label={t("settings.phone")}
          value={form.phone}
          onChange={v => onChange("phone", v)}
          type="tel"
        />
        <FieldInput
          label={t("settings.jobTitle")}
          value={form.jobTitle}
          onChange={v => onChange("jobTitle", v)}
        />
        <SelectField
          label={t("settings.department")}
          value={form.department}
          onChange={v => onChange("department", v)}
          options={departmentOptions}
        />
        <div className="sm:col-span-2 flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-600">{t("settings.bio")}</label>
          <textarea
            value={form.bio}
            onChange={e => onChange("bio", e.target.value)}
            placeholder={t("settings.bioPlaceholder")}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-[#2E75B6] focus:ring-2 focus:ring-blue-50 transition-all resize-none bg-white hover:border-gray-300"
          />
        </div>
      </div>
    </div>
  );
}
