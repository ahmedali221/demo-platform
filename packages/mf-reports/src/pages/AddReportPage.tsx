import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../lib/registerTranslations";
import "../index.css";
import { ReportTypeCard } from "../components/ReportTypeCard";
import { SelectDropdown } from "../components/SelectDropdown";
import { DateRangePicker, DateRange } from "../components/DateRangePicker";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportType = "daily" | "weekly" | "monthly" | "custom";

type SectionsState = {
  agentPerformance: boolean;
  slaRatio: boolean;
  operationalEfficiency: boolean;
  violations: boolean;
  shiftControl: boolean;
  platformComparison: boolean;
  bestWorstAgents: boolean;
  riskIndicators: boolean;
};


// ─── Toggle Switch ─────────────────────────────────────────────────────────────

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  isRtl?: boolean;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({
  checked,
  onChange,
  isRtl = false,
  disabled = false,
  className = '',
  size = 'md',
}) => {
  // Size configurations
  const sizes = {
    sm: { track: 'h-5 w-9', thumb: 'h-4 w-4', thumbOffset: '1px', thumbActive: '17px' },
    md: { track: 'h-6 w-10', thumb: 'h-5 w-5', thumbOffset: '1px', thumbActive: '17px' },
    lg: { track: 'h-7 w-12', thumb: 'h-6 w-6', thumbOffset: '1.5px', thumbActive: '22px' },
  };

  const { track, thumb, thumbOffset, thumbActive } = sizes[size];

  // Use inline style for translateX — dynamic Tailwind arbitrary classes don't compile at build time
  const thumbX = checked
    ? isRtl ? thumbOffset : thumbActive   // ON in RTL → left, ON in LTR → right
    : isRtl ? thumbActive : thumbOffset;  // OFF in RTL → right, OFF in LTR → left

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`
        relative inline-flex flex-shrink-0 cursor-pointer rounded-full
        transition-all duration-200 ease-in-out focus:outline-none
        focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
        ${checked ? 'bg-indigo-600' : 'bg-neutral-300 dark:bg-neutral-700'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${track}
        ${className}
      `}
    >
      <span
        className={`
          pointer-events-none absolute top-0.5 inline-block rounded-full
          bg-white shadow-sm ring-1 ring-black/10 transition-all duration-200 ease-in-out
          ${thumb}
          ${disabled ? 'shadow-none' : ''}
        `}
        style={{ transform: `translateX(${thumbX})` }}
      />
    </button>
  );
};

// ─── Back / breadcrumb icons ───────────────────────────────────────────────────

const ChevRight = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M6 4l4 4-4 4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SectionIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect x="2" y="2" width="14" height="14" rx="3" stroke="#312e81" strokeWidth="1.4" fill="none" />
    <path d="M5 6h8M5 9h8M5 12h5" stroke="#312e81" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <circle cx="9" cy="9" r="7" stroke="#312e81" strokeWidth="1.4" fill="none" />
    <path d="M9 8v5M9 6v.5" stroke="#312e81" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
);

const OptionsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M3 5h12M3 9h12M3 13h12" stroke="#312e81" strokeWidth="1.4" strokeLinecap="round" />
    <circle cx="6" cy="5" r="1.5" fill="#312e81" />
    <circle cx="12" cy="9" r="1.5" fill="#312e81" />
    <circle cx="7" cy="13" r="1.5" fill="#312e81" />
  </svg>
);

const TypeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <path d="M4 2h7l4 4v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z" stroke="#312e81" strokeWidth="1.4" fill="none" />
    <path d="M11 2v4h4" stroke="#312e81" strokeWidth="1.2" fill="none" />
    <path d="M6 10h6M6 13h4" stroke="#312e81" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const PageIcon = () => (
  <svg width="26" height="30" viewBox="0 0 26 30" fill="none">
    <path
      d="M4 2h12l7 7v18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
      stroke="#1e293b"
      strokeWidth="1.4"
      fill="none"
    />
    <path d="M16 2v7h7" stroke="#1e293b" strokeWidth="1.4" fill="none" />
    <path
      d="M7 15h12M7 20h8"
      stroke="#1e293b"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

const SECTION_KEYS: (keyof SectionsState)[] = [
  "agentPerformance",
  "slaRatio",
  "operationalEfficiency",
  "violations",
  "shiftControl",
  "platformComparison",
  "bestWorstAgents",
  "riskIndicators",
];

const AddReportPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRtl = i18n.language === "ar";

  // Form state
  const [reportType, setReportType] = useState<ReportType>("weekly");
  const [dateRange, setDateRange] = useState<DateRange>({
    start: null,
    end: null,
  });
  const [reportTitle, setReportTitle] = useState("");
  const [exportFormat, setExportFormat] = useState("");
  const [platform, setPlatform] = useState("");
  const [sections, setSections] = useState<SectionsState>({
    agentPerformance: false,
    slaRatio: false,
    operationalEfficiency: false,
    violations: false,
    shiftControl: false,
    platformComparison: false,
    bestWorstAgents: false,
    riskIndicators: false,
  });
  const [sendEmail, setSendEmail] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [notes, setNotes] = useState("");

  // Quick date presets
  const today = new Date();
  const applyQuickDate = (
    preset: "today" | "yesterday" | "last3" | "last10" | "thisMonth"
  ) => {
    const end = new Date(today);
    let start = new Date(today);
    if (preset === "yesterday") {
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
    } else if (preset === "last3") {
      start.setDate(start.getDate() - 2);
    } else if (preset === "last10") {
      start.setDate(start.getDate() - 9);
    } else if (preset === "thisMonth") {
      start = new Date(today.getFullYear(), today.getMonth(), 1);
    }
    setDateRange({ start, end });
  };

  const toggleSection = (key: keyof SectionsState) =>
    setSections((prev) => ({ ...prev, [key]: !prev[key] }));

  // Options
  const reportTypes: { type: ReportType; titleKey: string; descKey: string }[] =
    [
      {
        type: "weekly",
        titleKey: "reports.addReport.reportType.weekly.title",
        descKey: "reports.addReport.reportType.weekly.desc",
      },
      {
        type: "daily",
        titleKey: "reports.addReport.reportType.daily.title",
        descKey: "reports.addReport.reportType.daily.desc",
      },
      {
        type: "custom",
        titleKey: "reports.addReport.reportType.custom.title",
        descKey: "reports.addReport.reportType.custom.desc",
      },
      {
        type: "monthly",
        titleKey: "reports.addReport.reportType.monthly.title",
        descKey: "reports.addReport.reportType.monthly.desc",
      },
    ];

  const exportOptions = [
    { value: "pdf", label: "PDF" },
    { value: "excel", label: "Excel (CSV)" },
    {
      value: "both",
      label: t("reports.addReport.export.both", { defaultValue: "كلاهما" }),
    },
  ];

  const platformOptions = [
    { value: "all", label: t("reports.addReport.platform.all", { defaultValue: "الكل" }) },
    { value: "keta", label: "كيتا" },
    { value: "hungerstation", label: "هنقرستيشن" },
    { value: "jahez", label: "جاهز" },
  ];

  const quickPresets: { key: Parameters<typeof applyQuickDate>[0]; labelKey: string; defaultVal: string }[] = [
    { key: "today", labelKey: "reports.addReport.reportInfo.quick.today", defaultVal: "اليوم" },
    { key: "yesterday", labelKey: "reports.addReport.reportInfo.quick.yesterday", defaultVal: "أمس" },
    { key: "last3", labelKey: "reports.addReport.reportInfo.quick.last3", defaultVal: "آخر 3 أيام" },
    { key: "last10", labelKey: "reports.addReport.reportInfo.quick.last10", defaultVal: "آخر 10 أيام" },
    { key: "thisMonth", labelKey: "reports.addReport.reportInfo.quick.thisMonth", defaultVal: "هذا الشهر" },
  ];

  return (
    <div
      className="h-full flex flex-col bg-neutral-50 p-6 overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="mb-6">
        {/* Breadcrumb row */}
        <div className="flex items-center gap-2 mb-3 text-sm">
          <button
            onClick={() => navigate("/reports")}
            className="flex items-center gap-1 text-indigo-950 font-medium font-['Cairo'] hover:opacity-70 transition-opacity"
          >
            {isRtl ? (
              // RTL: text first (sits on the right), then right-pointing arrow (→ = go back in RTL)
              <>
                {t("reports.addReport.back", { defaultValue: "رجوع" })}
                <ChevRight />
              </>
            ) : (
              // LTR: left-pointing arrow (← = go back), then text
              <>
                <span className="rotate-180 inline-block"><ChevRight /></span>
                {t("reports.addReport.back", { defaultValue: "Back" })}
              </>
            )}
          </button>
          <span className="text-neutral-400">
            {t("reports.addReport.breadcrumb.reports", {
              defaultValue: "التقارير",
            })}
            {" / "}
            {t("reports.addReport.breadcrumb.addReport", {
              defaultValue: "إنشاء تقرير جديد",
            })}
          </span>
        </div>

        {/* Title row */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-indigo-950 font-['Cairo']">
              {t("reports.addReport.title", {
                defaultValue: "إنشاء تقرير جديد",
              })}
            </h1>
            <p className="text-sm text-neutral-500 mt-1 font-['Cairo']">
              {t("reports.addReport.subtitle", {
                defaultValue:
                  "حدد نوع التقرير والفترة الزمنية والأقسام المطلوبة",
              })}
            </p>
          </div>
          <PageIcon />
        </div>
      </header>

      {/* ── Two-column layout ───────────────────────────────────────────────
          In RTL: first DOM child = rightmost visual column (340px = type cards / info)
                  second DOM child = leftmost visual column (1fr = sections / extras)   */}
      <div className="flex-1 min-h-0 grid grid-cols-2 gap-5 items-stretch">

        {/* ── RIGHT COLUMN: نوع التقرير + معلومات التقرير ──────────────── */}
        <div className="flex flex-col gap-5 min-h-0">

          {/* نوع التقرير */}
          <section className="bg-white rounded-xl p-4 border border-neutral-200">
            <div className="flex items-center gap-2 mb-3">
              <TypeIcon />
              <h2 className="text-base font-bold text-indigo-950 font-['Cairo']">
                {t("reports.addReport.reportType.title", { defaultValue: "نوع التقرير" })}
              </h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {reportTypes.map(({ type, titleKey, descKey }) => (
                <ReportTypeCard
                  key={type}
                  title={t(titleKey)}
                  description={t(descKey)}
                  selected={reportType === type}
                  onSelect={() => setReportType(type)}
                />
              ))}
            </div>
          </section>

          {/* معلومات التقرير */}
          <section className="flex-1 min-h-0 bg-white rounded-xl p-4 border border-neutral-200 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <InfoIcon />
              <h2 className="text-base font-bold text-indigo-950 font-['Cairo']">
                {t("reports.addReport.reportInfo.title", { defaultValue: "معلومات التقرير" })}
              </h2>
            </div>

            {/* Date range picker */}
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              startLabel={t("reports.addReport.reportInfo.period", {
                defaultValue: "الفترة الزمنية",
              })}
              endLabel={t("reports.addReport.reportInfo.endDate", {
                defaultValue: "تاريخ النهاية",
              })}
              isRtl={isRtl}
            />

            {/* Quick date presets */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-xs text-neutral-400 font-['Cairo'] self-center">
                {t("reports.addReport.reportInfo.quickLabel", { defaultValue: "اختيار سريع:" })}
              </span>
              {quickPresets.map(({ key, labelKey, defaultVal }) => (
                <button
                  key={key}
                  onClick={() => applyQuickDate(key)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 hover:border-indigo-200 transition-colors font-['Cairo']"
                >
                  {t(labelKey, { defaultValue: defaultVal })}
                </button>
              ))}
            </div>

            {/* Report title */}
            <div className="mt-5">
              <label className="block text-sm font-bold text-indigo-950 mb-2 font-['Cairo']">
                {t("reports.addReport.reportInfo.reportTitle", {
                  defaultValue: "عنوان التقرير *",
                })}
              </label>
              <input
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                placeholder={t(
                  "reports.addReport.reportInfo.reportTitlePlaceholder",
                  {
                    defaultValue:
                      "مثال: تقرير أداء المناديب — أول 2025 القلندة",
                  }
                )}
                className={`w-full h-12 px-4 bg-neutral-100 rounded-xl outline outline-1 outline-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-2 focus:outline-indigo-600 focus:bg-white transition-colors font-['Cairo'] ${isRtl ? "text-right" : "text-left"}`}
              />
            </div>

            {/* Dropdowns: platform + export format */}
            <div className="grid grid-cols-2 gap-4 mt-5">
              <SelectDropdown
                label={t("reports.addReport.reportInfo.platform", {
                  defaultValue: "المنصة",
                })}
                options={platformOptions}
                value={platform}
                onChange={setPlatform}
                placeholder={t("reports.addReport.reportInfo.platform", {
                  defaultValue: "المنصة",
                })}
              />
              <SelectDropdown
                label={t("reports.addReport.reportInfo.exportFormat", {
                  defaultValue: "صيغة التصدير",
                })}
                options={exportOptions}
                value={exportFormat}
                onChange={setExportFormat}
                placeholder={t("reports.addReport.reportInfo.exportFormat", {
                  defaultValue: "صيغة التصدير",
                })}
              />
            </div>
          </section>
        </div>

        {/* ── LEFT COLUMN: أقسام التقرير + خيارات إضافية ────────────────── */}
        <div className="flex flex-col gap-5 min-h-0">

          {/* أقسام التقرير */}
          <section className="flex-1 min-h-0 bg-white rounded-xl p-4 border border-neutral-200 flex flex-col">
            <div className="flex items-center gap-2 mb-4">
              <SectionIcon />
              <h2 className="text-base font-bold text-indigo-950 font-['Cairo']">
                {t("reports.addReport.sections.title", { defaultValue: "أقسام التقرير" })}
              </h2>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-3 content-start">
              {SECTION_KEYS.map((key) => {
                const checked = sections[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleSection(key)}
                    className={`
                      w-full p-4 rounded-xl text-start transition-all
                      flex items-center gap-2
                      ${checked
                        ? "bg-indigo-50 outline outline-2 outline-indigo-600"
                        : "bg-neutral-100 outline outline-1 outline-neutral-200 hover:bg-neutral-50"
                      }
                    `}
                  >
                    {/* Checkbox indicator */}
                    <div className={`
                      w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                      ${checked ? "bg-indigo-900 border-indigo-900" : "border-neutral-400"}
                    `}>
                      {checked && (
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    {/* Section label */}
                    <span className={`text-xs font-bold font-['Cairo'] leading-tight ${checked ? "text-indigo-900" : "text-neutral-700"}`}>
                      {t(`reports.addReport.sections.${key}`, { defaultValue: key })}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* خيارات إضافية */}
          <section className="bg-white rounded-xl p-4 border border-neutral-200">
            <div className="flex items-center gap-2 mb-4">
              <OptionsIcon />
              <h2 className="text-base font-bold text-indigo-950 font-['Cairo']">
                {t("reports.addReport.additionalOptions.title", { defaultValue: "خيارات إضافية" })}
              </h2>
            </div>

            {/* Send email */}
            <div className="flex items-center justify-between gap-4 mb-6 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
              <div>
                <div className="text-sm font-semibold text-neutral-800 font-['Cairo']">
                  {t("reports.addReport.additionalOptions.sendEmail", {
                    defaultValue: "إرسال التقرير بالبريد الإلكتروني",
                  })}
                </div>
                <div className="text-xs text-neutral-400 mt-1 font-['Cairo']">
                  {t("reports.addReport.additionalOptions.sendEmailDesc", {
                    defaultValue: "سيتم الإرسال إلى إيميل المنصة",
                  })}
                </div>
              </div>
              <ToggleSwitch checked={sendEmail} onChange={setSendEmail} isRtl={isRtl} />
            </div>

            {/* Recurring */}
            <div className="flex items-center justify-between gap-4 mb-6 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
              <div>
                <div className="text-sm font-semibold text-neutral-800 font-['Cairo']">
                  {t("reports.addReport.additionalOptions.recurring", {
                    defaultValue: "تكرار تلقائي",
                  })}
                </div>
                <div className="text-xs text-neutral-400 mt-1 font-['Cairo']">
                  {t("reports.addReport.additionalOptions.recurringDesc", {
                    defaultValue:
                      "إعادة إنشاء التقرير تلقائياً بنفس الإعدادات دورياً",
                  })}
                </div>
              </div>
              <ToggleSwitch checked={recurring} onChange={setRecurring} isRtl={isRtl} />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-bold text-black mb-2 font-['Cairo']">
                {t("reports.addReport.additionalOptions.notes", {
                  defaultValue: "ملاحظات",
                })}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t(
                  "reports.addReport.additionalOptions.notesPlaceholder",
                  {
                    defaultValue:
                      "أي ملاحظات أو تعليمات خاصة بالتقرير...",
                  }
                )}
                rows={4}
                className="w-full px-4 py-3 bg-neutral-100 rounded-xl text-sm text-neutral-800 placeholder-neutral-400 font-['Cairo'] resize-none focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-colors"
                style={{ textAlign: isRtl ? "right" : "left" }}
              />
            </div>
          </section>

          {/* Action buttons */}
          <div className="flex gap-3 justify-start">
            <button
              onClick={() => navigate("/reports")}
              className="px-6 py-3 rounded-xl border-2 border-indigo-200 bg-white text-sm font-bold text-indigo-900 hover:bg-indigo-50 transition-colors font-['Cairo']"
            >
              {t("reports.addReport.cancel", { defaultValue: "إلغاء" })}
            </button>
            <button className="px-6 py-3 rounded-xl bg-indigo-700 text-white text-sm font-bold hover:bg-indigo-800 transition-colors font-['Cairo'] shadow-sm">
              {t("reports.addReport.save", { defaultValue: "حفظ التقرير" })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddReportPage;
