import React, { useState, useEffect, useRef } from "react";

// ─── Color Schemes ────────────────────────────────────────────────────────────

const CS = {
  good: { bg: "#27AE6040", text: "#006733" },
  Green: { bg: "#27AE6040", text: "#006733" },
  average: { bg: "#F9731633", text: "#F97316" },
  Yellow: { bg: "#F9731633", text: "#F97316" },
  bad: { bg: "#C0392B33", text: "#C0392B" },
  Red: { bg: "#C0392B33", text: "#C0392B" },
};

// ─── Tag Styles ───────────────────────────────────────────────────────────────

const tagStyles: Record<string, { border: string; text: string; bg: string }> =
  {
    orange: { border: "#F97316", text: "#F97316", bg: "#F9731614" },
    blue: { border: "#3B82F6", text: "#3B82F6", bg: "#3B82F614" },
    purple: { border: "#7C3AED", text: "#7C3AED", bg: "#7C3AED14" },
    green: { border: "#006733", text: "#006733", bg: "#00673314" },
    default: { border: "#94A3B8", text: "#64748B", bg: "#F1F5F9" },
  };

// ─── SLA orb gradients per scheme ────────────────────────────────────────────

const slaOrb: Record<string, string> = {
  good: "linear-gradient(135deg, #16A34A, #34D399)",
  average: "linear-gradient(135deg, #F97316, #EAB308)",
  bad: "linear-gradient(135deg, #DC2626, #F97316)",
  Green: "linear-gradient(135deg, #16A34A, #34D399)",
  Yellow: "linear-gradient(135deg, #F97316, #EAB308)",
  Red: "linear-gradient(135deg, #DC2626, #F97316)",
};

// ─── Courier Variant ──────────────────────────────────────────────────────────

export interface CourierCardData {
  id: string;
  courierId: string;
  provider: string;
  externalId: string;
  fullName: string;
  cityNameEn: string;
  cityNameAr: string;
  memberSince: string;
  phone: string;
  cleanCompletionRate: number;
  onTimeDeliveryRate: number;
  availableDaysCount: string;
  experienceGrade: string;
  completedOrdersCount: string;
  externalName: string;
  isVerified: boolean;
  status: "Active" | "Inactive";
  currentRiskLevel: "Green" | "Yellow" | "Red";
  riskLevel: "Green" | "Yellow" | "Red";
  recommendedAction: string;
  estimatedLevel: "A" | "B" | "C";
  rankingPercentile: number;
  onTimeRate: number;
  orderCompletionRate: number;
  scoreForForcedAssignment: number;
  orderVolume: number;
  violationsCount: number | null;
  previousActionsCount: number | null;
  dir?: "rtl" | "ltr";
}
// ─── Report Variant ───────────────────────────────────────────────────────────

interface ReportStat {
  label: string;
  value: number | null; // null = dash (error state)
  color?: string;
  unit?: string; // shown below value in modal
}

interface ReportDetail {
  label: string;
  value: string;
  icon: "calendar" | "user" | "file" | "id";
}

interface ReportModalConfig {
  detailsLabel?: string;
  details: ReportDetail[];
  alert?: { title: string; description: string };
  pdfLabel?: string;
  csvLabel?: string;
  onDownloadPDF?: () => void;
  onExportCSV?: () => void;
}

interface ReportCardData {
  title: string;
  id: string;
  status: string;
  statusScheme: "good" | "average" | "bad";
  date: string;
  tags: Array<{
    label: string;
    variant: "orange" | "blue" | "purple" | "green" | "default";
  }>;
  stats: ReportStat[];
  sla?: {
    percent: number;
    statusLabel: string;
    slaScheme?: "good" | "average" | "bad";
    slaLabel?: string;
    targetPercent: number;
    targetLabel: string;
    minLabel: string;
    maxLabel: string;
  };
  errorMessage?: string;
  owner: { name: string; initial: string };
  meta: string;
  dir?: "rtl" | "ltr";
  modal?: ReportModalConfig;
}

// ─── Unified Props ────────────────────────────────────────────────────────────

type KpiCardProps =
  | { variant: "courier"; data: CourierCardData; onViewFile?: () => void }
  | { variant: "report"; data: ReportCardData; onView?: () => void };

// ─── Inline SVGs ─────────────────────────────────────────────────────────────

const TickIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#006733"
    strokeWidth="2.5"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const ArrowIcon = ({ flipped }: { flipped?: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={flipped ? { transform: "rotate(180deg)" } : undefined}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);

const CalendarIcon = ({ size = 16 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="3" y="4" width="18" height="18" rx="3" ry="3" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const UserIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="12" cy="8" r="4" />
    <path strokeLinecap="round" d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

const FileIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"
    />
    <polyline
      strokeLinecap="round"
      strokeLinejoin="round"
      points="14 2 14 8 20 8"
    />
  </svg>
);

const IdIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <line x1="2" y1="10" x2="22" y2="10" />
    <line x1="7" y1="15" x2="10" y2="15" />
  </svg>
);

const WarningIcon = ({ color }: { color: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={color}>
    <path d="M12 2L1 21h22L12 2zm0 3.5L20.5 19h-17L12 5.5zM11 10v4h2v-4h-2zm0 6v2h2v-2h-2z" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const detailIconMap = {
  calendar: <CalendarIcon />,
  user: <UserIcon />,
  file: <FileIcon />,
  id: <IdIcon />,
};

// ─── Tag Chip ─────────────────────────────────────────────────────────────────

const TagChip = ({ label, variant }: { label: string; variant: string }) => {
  const s = tagStyles[variant] ?? tagStyles.default;
  return (
    <span
      className="text-xs font-black px-3 py-1 rounded-full border uppercase"
      style={{ borderColor: s.border, color: s.text, background: s.bg }}
    >
      {label}
    </span>
  );
};

// ─── Report Modal ─────────────────────────────────────────────────────────────

const ReportModal = ({
  data,
  onClose,
}: {
  data: ReportCardData;
  onClose: () => void;
}) => {
  const cfg = data.modal!;
  const dir = data.dir ?? "rtl";
  const sla = data.sla;
  const ss = CS[data.statusScheme];
  const slaScheme = sla?.slaScheme ?? "average";
  const slaColor = CS[slaScheme].text;
  const contentRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleDownloadPDF = async () => {
    if (!contentRef.current || exporting) return;
    setExporting(true);
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgW = canvas.width;
      const imgH = canvas.height;
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [imgW / 2, imgH / 2],
      });
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        imgW / 2,
        imgH / 2,
      );
      pdf.save(`${data.id}.pdf`);
      cfg.onDownloadPDF?.();
    } finally {
      setExporting(false);
    }
  };

  const handleExportExcel = async () => {
    const { utils, writeFile } = await import("xlsx");
    const rows: (string | number | null)[][] = [
      ["Report Title", data.title],
      ["Report ID", data.id],
      ["Status", data.status],
      ["Date", data.date],
      ["Tags", data.tags.map((t) => t.label).join(", ")],
      ["Owner", data.owner.name],
      [],
      ["Metric", "Value", "Unit"],
      ...data.stats.map((s) => [s.label, s.value ?? "—", s.unit ?? ""]),
    ];
    if (sla) {
      rows.push(
        [],
        ["SLA %", sla.percent + "%"],
        ["SLA Status", sla.statusLabel],
      );
    }
    if (cfg.details?.length) {
      rows.push([], ["Field", "Value"]);
      cfg.details.forEach((d) => rows.push([d.label, d.value]));
    }
    if (data.errorMessage) {
      rows.push([], ["Error", data.errorMessage]);
    }
    const ws = utils.aoa_to_sheet(rows);
    ws["!cols"] = [{ wch: 20 }, { wch: 30 }, { wch: 15 }];
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Report");
    writeFile(wb, `${data.id}.xlsx`);
    cfg.onExportCSV?.();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)" }}
      onClick={onClose}
    >
      <div
        ref={contentRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto flex flex-col gap-4 p-6"
        dir={dir}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex justify-between items-start">
          {/* Close button */}
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] cursor-pointer"
          >
            <CloseIcon />
          </button>
          {/* Title block */}
          <div className="flex flex-col items-end gap-0.5">
            <p className="text-xs text-[#94A3B8]">
              {cfg.detailsLabel ?? "تفاصيل التقرير"}
            </p>
            <h2 className="text-black text-xl font-bold">{data.title}</h2>
            <p className="text-sm text-[#94A3B8]">{data.id}</p>
          </div>
        </div>

        {/* ── Status + Tags ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status as a chip (no outline, same as list card) */}
          <span
            className="text-xs font-black px-3 py-1 rounded-full uppercase"
            style={{ background: ss.bg, color: ss.text }}
          >
            {data.status}
          </span>
          {data.tags.map((tag, i) => (
            <TagChip key={i} label={tag.label} variant={tag.variant} />
          ))}
        </div>

        {/* ── SLA highlight box ── */}
        {sla && (
          <div
            className="w-full p-4 rounded-xl flex justify-between items-center gap-4"
            style={{
              background: `${CS[slaScheme].text}0D`,
              outline: `1px solid ${slaColor}`,
            }}
          >
            {/* Orb */}
            <div
              className="w-16 h-16 rounded-full flex-shrink-0 opacity-85"
              style={{
                background: slaOrb[slaScheme],
                boxShadow: `0 4px 15px 0 ${slaColor}66`,
              }}
            />
            {/* Numbers */}
            <div className="flex flex-col items-end gap-0.5">
              <p className="text-xs text-[#94A3B8]">
                {sla.slaLabel ?? "نسبة الخدمة SLA"}
              </p>
              <p
                className="text-4xl font-extrabold"
                style={{ color: slaColor }}
              >
                {sla.percent}%
              </p>
              <div className="flex items-center gap-1">
                <span className="text-xs font-bold" style={{ color: slaColor }}>
                  {sla.statusLabel}
                </span>
                <WarningIcon color={slaColor} />
              </div>
            </div>
          </div>
        )}

        {/* Error in place of SLA */}
        {!sla && data.errorMessage && (
          <div
            className="w-full p-4 rounded-xl flex items-center gap-2"
            style={{
              background: CS.bad.bg,
              outline: `1px solid ${CS.bad.text}`,
            }}
          >
            <WarningIcon color={CS.bad.text} />
            <span className="text-sm font-bold" style={{ color: CS.bad.text }}>
              {data.errorMessage}
            </span>
          </div>
        )}

        {/* ── Stats 2×2 grid ── */}
        <div className="grid grid-cols-2 gap-3">
          {data.stats &&
            data.stats.map((stat, i) => (
              <div
                key={i}
                className="p-3 bg-[#F5F5F5] rounded-xl border border-[#E2E8F0] flex flex-col items-center gap-1"
              >
                <p className="text-[10px] text-[#94A3B8] text-center">
                  {stat.label}
                </p>
                <span
                  className="text-4xl font-bold"
                  style={{ color: stat.color ?? "#191C1E" }}
                >
                  {stat.value === null ? "—" : stat.value}
                </span>
                {stat.unit && (
                  <p className="text-[10px] text-[#94A3B8] text-center">
                    {stat.unit}
                  </p>
                )}
              </div>
            ))}
        </div>

        {/* ── Details table ── */}
        {cfg.details && cfg.details.length > 0 && (
          <div className="bg-[#F5F5F5] rounded-xl p-4 flex flex-col gap-0 shadow-sm">
            {cfg.details.map((row, i) => (
              <div
                key={i}
                className="flex justify-between items-center py-1.5 border-b border-[#E2E8F0] last:border-b-0"
              >
                <span className="text-xs font-bold text-[#191C1E]">
                  {row.value}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-[#52525B]">{row.label}</span>
                  <span className="text-[#3F3F46]">
                    {detailIconMap[row.icon]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Alert box ── */}
        {cfg.alert && (
          <div
            className="w-full p-3 rounded-xl flex flex-col items-end gap-2"
            style={{
              background: CS.average.bg,
              outline: `1px solid ${CS.average.text}`,
            }}
          >
            <div className="flex items-center gap-1">
              <span
                className="text-xs font-bold"
                style={{ color: CS.average.text }}
              >
                {cfg.alert.title}
              </span>
              <WarningIcon color={CS.average.text} />
            </div>
            <p className="text-xs text-[#191C1E] text-right w-full">
              {cfg.alert.description}
            </p>
          </div>
        )}

        {/* ── Action buttons ── */}
        {(cfg.pdfLabel || cfg.csvLabel) && (
          <div className="flex gap-3 mt-1">
            {cfg.pdfLabel && (
              <button
                onClick={handleDownloadPDF}
                disabled={exporting}
                className="flex-1 h-12 px-4 rounded-lg border border-[#1e3a5f] flex items-center justify-center gap-2 font-bold text-sm text-[#1e3a5f] cursor-pointer hover:bg-[#1e3a5f10] disabled:opacity-50 disabled:cursor-wait"
              >
                {exporting ? "..." : cfg.pdfLabel}
                <FileIcon />
              </button>
            )}
            {cfg.csvLabel && (
              <button
                onClick={handleExportExcel}
                className="flex-1 h-12 px-4 rounded-lg bg-[#F97316] flex items-center justify-center gap-2 font-bold text-sm text-white cursor-pointer hover:bg-[#EA6C0A]"
              >
                {cfg.csvLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Courier Card Layout ──────────────────────────────────────────────────────

const CourierCard = ({
  data,
  onViewFile,
}: {
  data: CourierCardData;
  onViewFile?: () => void;
}) => {
  const scheme = CS[data.currentRiskLevel];
  const dir = data.dir ?? "rtl";
  const isLtr = dir === "ltr";

  const stats = [
    { label: "الالتزام بالوقت", value: `${data.onTimeRate}%` },
    { label: "إكمال الطلبات", value: `${data.orderCompletionRate}%` },
    { label: "حجم الطلبات", value: data.orderVolume },
    { label: "نقاط التعيين", value: data.scoreForForcedAssignment },
    { label: "الترتيب المئوي", value: `${data.rankingPercentile}%` },
    { label: "المستوى المقدر", value: data.estimatedLevel },
  ];

  return (
    <div
      className="rounded-2xl flex flex-col border border-[#d8d8d8] bg-white shadow-md overflow-hidden"
      dir={dir}
    >
      <div className="flex flex-col gap-4 p-5">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex gap-3">
            <div
              className="h-12 w-12 flex-shrink-0 flex items-center justify-center rounded-xl text-lg font-bold"
              style={{ background: scheme.bg, color: scheme.text }}
            >
              {data.externalName[0]}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-base text-[#191C1E] leading-tight">
                {data.externalName}
              </span>
              <span className="text-xs text-[#94A3B8]">{data.externalId}</span>
              <span className="text-xs font-medium text-[#E67E22]">
                {data.provider}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span
              className="text-xs font-semibold px-3 py-0.5 rounded-full"
              style={{ background: scheme.bg, color: scheme.text }}
            >
              {data.currentRiskLevel}
            </span>
            <span
              className={`text-xs font-semibold px-3 py-0.5 rounded-full ${
                data.status === "Active"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-neutral-100 text-neutral-500"
              }`}
            >
              {data.status === "Active" ? "نشط" : "غير نشط"}
            </span>
            {data.isVerified && (
              <span className="text-xs font-semibold px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 flex items-center gap-1">
                <TickIcon /> موثق
              </span>
            )}
          </div>
        </div>

        {/* Stats 3×2 grid */}
        <div className="grid grid-cols-3 gap-2">
          {stats &&
            stats.map((s, i) => (
              <div
                key={i}
                className="bg-[#F7F7F7] border border-[#E2E8F0] rounded-xl p-2.5 flex flex-col items-center gap-0.5"
              >
                <p className="text-[10px] text-[#94A3B8] text-center leading-tight">
                  {s.label}
                </p>
                <span className="text-sm font-bold text-[#191C1E]">
                  {s.value}
                </span>
              </div>
            ))}
        </div>

        {/* Violations + Previous Actions */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-[#F7F7F7] border border-[#E2E8F0] rounded-xl p-2.5 flex flex-col items-center gap-0.5">
            <p className="text-[10px] text-[#94A3B8] text-center">المخالفات</p>
            <span className="text-sm font-bold text-[#C0392B]">
              {data.violationsCount === null ? "—" : data.violationsCount}
            </span>
          </div>
          <div className="bg-[#F7F7F7] border border-[#E2E8F0] rounded-xl p-2.5 flex flex-col items-center gap-0.5">
            <p className="text-[10px] text-[#94A3B8] text-center">
              الإجراءات السابقة
            </p>
            <span className="text-sm font-bold text-[#191C1E]">
              {data.previousActionsCount === null
                ? "—"
                : data.previousActionsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-[#F2F4F6] border-t border-[#d8d8d8] px-5 py-3 flex justify-between items-center">
        <button
          onClick={onViewFile}
          className="text-[#191C1E] border flex gap-1 items-center border-[#E67E22] rounded-2xl font-bold p-2 text-sm cursor-pointer"
        >
          عرض الملف
          <ArrowIcon flipped={isLtr} />
        </button>
        <span className="text-xs text-[#94A3B8]">{data.recommendedAction}</span>
      </div>
    </div>
  );
};

// ─── Report Card Layout ───────────────────────────────────────────────────────

const ReportCard = ({
  data,
  onView,
}: {
  data: ReportCardData;
  onView?: () => void;
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const dir = data.dir ?? "rtl";
  const ss = CS[data.statusScheme];
  const sla = data.sla;
  const slaScheme = sla?.slaScheme ?? "average";
  const slaColor = CS[slaScheme].text;
  const hasModal = !!data.modal;

  const handleClick = () => {
    if (hasModal) setModalOpen(true);
    onView?.();
  };

  return (
    <>
      <div
        className={`rounded-2xl flex flex-col border border-[#d8d8d8] bg-white shadow-md overflow-hidden transition-shadow ${hasModal ? "cursor-pointer hover:shadow-lg" : ""}`}
        dir={dir}
        onClick={handleClick}
      >
        {/* Body */}
        <div className="flex flex-col gap-4 p-5">
          {/* Title row */}
          <div className="flex justify-between items-start">
            <span
              className="text-xs font-semibold px-3 py-0.5 rounded-full"
              style={{ background: ss.bg, color: ss.text }}
            >
              {data.status}
            </span>
            <div className="flex flex-col items-end gap-0.5">
              <h3 className="font-bold text-base text-[#191C1E] leading-tight">
                {data.title}
              </h3>
              <span className="text-xs text-[#E67E22] font-medium">
                {data.id}
              </span>
            </div>
          </div>

          {/* Date + Tags */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 border border-[#d8d8d8] rounded-full px-3 py-1 text-sm text-[#191C1E]">
              <CalendarIcon />
              <span>{data.date}</span>
            </div>
            {data.tags.map((tag, i) => (
              <TagChip key={i} label={tag.label} variant={tag.variant} />
            ))}
          </div>

          {/* Stats */}
          <div
            className="grid gap-2"
            style={{ gridTemplateColumns: `repeat(${data.stats.length}, 1fr)` }}
          >
            {data.stats.map((stat, i) => (
              <div
                key={i}
                className="bg-[#F7F7F7] border border-[#E2E8F0] rounded-xl p-3 flex flex-col items-center gap-0.5"
              >
                <p className="text-[10px] text-[#94A3B8] text-center">
                  {stat.label}
                </p>
                <span
                  className="text-lg font-bold"
                  style={{ color: stat.color ?? "#191C1E" }}
                >
                  {stat.value === null ? "—" : stat.value}
                </span>
              </div>
            ))}
          </div>

          {/* SLA bar */}
          {sla && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold" style={{ color: slaColor }}>
                  {sla.percent}% {sla.statusLabel}
                </span>
                <span className="text-xs text-[#94A3B8]">
                  {sla.slaLabel ?? "نسبة SLA"}
                </span>
              </div>
              <div className="relative bg-[#ECEEF0] w-full h-2 rounded-full overflow-hidden">
                <div
                  className="h-2 rounded-full"
                  style={{ width: `${sla.percent}%`, background: slaColor }}
                />
                {/* Target marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-[#94A3B8]"
                  style={{ left: `${sla.targetPercent}%` }}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-[#94A3B8]">
                  {sla.maxLabel}
                </span>
                <span className="text-[10px] text-[#94A3B8]">
                  {sla.targetLabel}
                </span>
              </div>
            </div>
          )}

          {/* Error message (replaces SLA) */}
          {!sla && data.errorMessage && (
            <div
              className="flex items-center gap-2 p-3 rounded-xl"
              style={{ background: CS.bad.bg }}
            >
              <WarningIcon color={CS.bad.text} />
              <span
                className="text-xs font-bold"
                style={{ color: CS.bad.text }}
              >
                {data.errorMessage}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#F2F4F6] border-t border-[#d8d8d8] px-5 py-3 flex justify-between items-center">
          <span className="text-xs text-[#94A3B8]">{data.meta}</span>
          <div className="flex items-center gap-2 text-sm font-medium text-[#191C1E]">
            <span
              className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "#94A3B8" }}
            >
              {data.owner.initial}
            </span>
            <span>{data.owner.name}</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && data.modal && (
        <ReportModal data={data} onClose={() => setModalOpen(false)} />
      )}
    </>
  );
};

// ─── KpiCard (unified entry point) ───────────────────────────────────────────
import { useNavigate } from "react-router-dom";

const KpiCard = (props: KpiCardProps) => {
  const navigate = useNavigate();
  if (props.variant === "courier") {
    return (
      <CourierCard
        data={props.data}
        onViewFile={() =>
          navigate(
            `/couriers/${props.data.courierId}?provider=${props.data.provider}`,
          )
        }
      />
    );
  }
  return <ReportCard data={props.data} onView={props.onView} />;
};

export default KpiCard;
