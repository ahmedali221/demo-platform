import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { RotateCcw } from "lucide-react";
import Breadcrumb from "../../shared/Breadcrumb";
import "../../lib/i18n";
import "../../index.css";
import {
  type SlaObjective,
  getSlaObjectives,
  updateSlaObjective,
  resetSlaObjectives,
} from "./sla.service";

// ── KPI metadata (all 14 from the API spec) ───────────────────────────────────

type Unit = "ratio" | "minutes" | "tasks_hr" | "count";

interface KpiMeta {
  labelEn: string;
  labelAr: string;
  unit: Unit;
  affectsScore: boolean;
}

const KPI_META: Record<number, KpiMeta> = {
  1:  { labelEn: "On-Time Delivery Rate",      labelAr: "نسبة التوصيل في الوقت",       unit: "ratio",    affectsScore: true  },
  2:  { labelEn: "Completion Rate",            labelAr: "نسبة الإكمال",                unit: "ratio",    affectsScore: false },
  3:  { labelEn: "Cancellation Rate",          labelAr: "نسبة الإلغاء",                unit: "ratio",    affectsScore: true  },
  4:  { labelEn: "Rejection Rate",             labelAr: "نسبة الرفض",                  unit: "ratio",    affectsScore: false },
  5:  { labelEn: "Shift Attendance Rate",      labelAr: "نسبة حضور الوردية",           unit: "ratio",    affectsScore: false },
  6:  { labelEn: "Operational Efficiency",     labelAr: "الكفاءة التشغيلية",           unit: "tasks_hr", affectsScore: true  },
  7:  { labelEn: "Max Violations",             labelAr: "الحد الأقصى للمخالفات",       unit: "count",    affectsScore: false },
  8:  { labelEn: "Acceptance Rate",            labelAr: "نسبة القبول",                 unit: "ratio",    affectsScore: true  },
  9:  { labelEn: "Avg Delivery Time",          labelAr: "متوسط وقت التوصيل",           unit: "minutes",  affectsScore: true  },
  10: { labelEn: "Attendance Rate",            labelAr: "نسبة الحضور",                 unit: "ratio",    affectsScore: false },
  11: { labelEn: "Validity Tier A Min Tasks",  labelAr: "الحد الأدنى للمهام - فئة A",  unit: "count",    affectsScore: true  },
  12: { labelEn: "Validity Tier B Min Tasks",  labelAr: "الحد الأدنى للمهام - فئة B",  unit: "count",    affectsScore: true  },
  13: { labelEn: "Validity Tier C Min Tasks",  labelAr: "الحد الأدنى للمهام - فئة C",  unit: "count",    affectsScore: true  },
  14: { labelEn: "Validity Tier D Min Tasks",  labelAr: "الحد الأدنى للمهام - فئة D",  unit: "count",    affectsScore: true  },
};

const UNIT_RANGE: Record<Unit, { min: number; max: number; step: number }> = {
  ratio:    { min: 0, max: 1,   step: 0.01 },
  minutes:  { min: 0, max: 120, step: 1    },
  tasks_hr: { min: 0, max: 20,  step: 0.1  },
  count:    { min: 0, max: 1000, step: 1   },
};

function fmt(value: number, unit: Unit): string {
  if (unit === "ratio")    return `${Math.round(value * 100)}%`;
  if (unit === "minutes")  return `${value} min`;
  if (unit === "tasks_hr") return `${parseFloat(value.toFixed(1))} tasks/hr`;
  return String(Math.round(value));
}

// ── Local state ───────────────────────────────────────────────────────────────

interface LocalObjective extends SlaObjective {
  unit: Unit;
}

// ── Validation ────────────────────────────────────────────────────────────────

function validate(obj: LocalObjective): string | null {
  if (obj.weight <= 0) return "Weight must be > 0";
  const { nearValue: near, targetValue: target, limitValue: limit, direction, unit } = obj;
  if (unit === "ratio" && [near, target, limit].some(v => v < 0 || v > 1)) {
    return "Ratio values must be between 0 and 1";
  }
  if (direction === 1) {
    if (!(limit < near && near < target)) return "HigherIsBetter: Limit < Near < Target";
  } else {
    if (!(target < near && near < limit)) return "LowerIsBetter: Target < Near < Limit";
  }
  return null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function pct(value: number, min: number, max: number): number {
  if (max === min) return 0;
  return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
}

function isDirty(original: SlaObjective, local: LocalObjective): boolean {
  return (
    original.weight      !== local.weight      ||
    original.nearValue   !== local.nearValue   ||
    original.targetValue !== local.targetValue ||
    original.limitValue  !== local.limitValue  ||
    original.isActive    !== local.isActive
  );
}

// ── MetricCard ────────────────────────────────────────────────────────────────

interface CardProps {
  obj: LocalObjective;
  onChange: (updated: Partial<LocalObjective>) => void;
  lang: string;
}

function MetricCard({ obj, onChange, lang }: CardProps) {
  const { t } = useTranslation();
  const meta = KPI_META[obj.kpiType];
  if (!meta) return null;

  const label = lang === "ar" ? meta.labelAr : meta.labelEn;
  const { unit, direction, nearValue, targetValue, limitValue, weight, isActive } = obj;
  const { min, max, step } = UNIT_RANGE[unit];
  const hib = direction === 1; // HigherIsBetter

  // Slider ordering constraints
  // HigherIsBetter: limit < near < target
  // LowerIsBetter:  target < near < limit
  const limitMin  = hib ? min            : nearValue  + step;
  const limitMax  = hib ? nearValue - step : max;
  const nearMin   = hib ? limitValue + step : targetValue + step;
  const nearMax   = hib ? targetValue - step : limitValue - step;
  const targetMin = hib ? nearValue + step  : min;
  const targetMax = hib ? max               : nearValue - step;

  const isHighImpact = obj.kpiType >= 11 && obj.kpiType <= 14;

  return (
    <div className={["self-stretch p-6 bg-white rounded-2xl flex flex-col gap-6", !isActive ? "opacity-60" : "", isHighImpact ? "ring-2 ring-amber-300" : ""].join(" ")}>
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-extrabold text-black">{label}</span>
          {obj.kpiType >= 11 && obj.kpiType <= 14 ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-300">
              {lang === "ar" ? "يحدد التقييم A–E" : "Drives A–E Grade"}
            </span>
          ) : meta.affectsScore ? (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
              {lang === "ar" ? "يؤثر في الدرجة" : "Affects Score"}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-500 border border-gray-200">
              {lang === "ar" ? "غير نشط في التقييم" : "Not in Scoring"}
            </span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Weight */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">{lang === "ar" ? "الوزن" : "Weight"}</span>
            <input
              type="number"
              min={0.1}
              step={0.1}
              value={weight}
              onChange={e => onChange({ weight: parseFloat(e.target.value) || 0 })}
              className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-xs text-center focus:outline-none focus:border-[#2E75B6]"
            />
          </div>

          {/* isActive toggle */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">{lang === "ar" ? "نشط" : "Active"}</span>
            <button
              type="button"
              onClick={() => onChange({ isActive: !isActive })}
              className={["relative w-10 h-5 rounded-full transition-colors shrink-0", isActive ? "bg-[#2E75B6]" : "bg-gray-200"].join(" ")}
            >
              <span className={["absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200", isActive ? "left-5" : "left-0.5"].join(" ")} />
            </button>
          </div>
        </div>
      </div>

      {/* Preview bar */}
      <div className="self-stretch p-3 bg-white rounded-xl outline outline-[0.25px] outline-offset-[-0.25px] outline-neutral-400 flex flex-col gap-1.5">
        <div className="flex justify-between text-[10px] font-bold gap-2 flex-wrap">
          <span className="text-red-700">
            {lang === "ar" ? "الحد" : "Limit"}: {fmt(limitValue, unit)}
          </span>
          <span className="text-amber-600">
            {lang === "ar" ? "قريب" : "Near"}: {fmt(nearValue, unit)}
          </span>
          <span className="text-blue-900">
            {lang === "ar" ? "الهدف" : "Target"}: {fmt(targetValue, unit)}
          </span>
        </div>

        <div className="h-3 relative bg-gray-100 rounded-xl overflow-hidden" dir="ltr">
          <div className="absolute top-0 h-full w-0.5 bg-red-700 z-10"   style={{ left: `${pct(limitValue,  min, max)}%` }} />
          <div className="absolute top-0 h-full w-0.5 bg-amber-500 z-10" style={{ left: `${pct(nearValue,   min, max)}%` }} />
          <div className="absolute top-0 h-full w-0.5 bg-blue-900 z-10"  style={{ left: `${pct(targetValue, min, max)}%` }} />
        </div>

        <div className="flex justify-between text-[10px] text-neutral-400" dir="ltr">
          <span>{fmt(min, unit)}</span>
          <span>{fmt(max, unit)}</span>
        </div>
      </div>

      {/* Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Limit (red) */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-extrabold text-red-700">
            {lang === "ar" ? "الحد" : "Limit"}: {fmt(limitValue, unit)}
          </span>
          <input
            type="range" dir="ltr"
            min={limitMin} max={limitMax} step={step} value={limitValue}
            onChange={e => onChange({ limitValue: parseFloat(e.target.value) })}
            className="w-full sla-slider-red"
            style={{ background: `linear-gradient(to right, #b91c1c 0%, #b91c1c ${pct(limitValue, limitMin, limitMax)}%, #f3f4f6 ${pct(limitValue, limitMin, limitMax)}%, #f3f4f6 100%)` }}
          />
        </div>

        {/* Near (amber) */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-extrabold text-amber-600">
            {lang === "ar" ? "قريب" : "Near"}: {fmt(nearValue, unit)}
          </span>
          <input
            type="range" dir="ltr"
            min={nearMin} max={nearMax} step={step} value={nearValue}
            onChange={e => onChange({ nearValue: parseFloat(e.target.value) })}
            className="w-full sla-slider-red"
            style={{ background: `linear-gradient(to right, #d97706 0%, #d97706 ${pct(nearValue, nearMin, nearMax)}%, #f3f4f6 ${pct(nearValue, nearMin, nearMax)}%, #f3f4f6 100%)` }}
          />
        </div>

        {/* Target (blue) */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-extrabold text-blue-900">
            {lang === "ar" ? "الهدف" : "Target"}: {fmt(targetValue, unit)}
          </span>
          <input
            type="range" dir="ltr"
            min={targetMin} max={targetMax} step={step} value={targetValue}
            onChange={e => onChange({ targetValue: parseFloat(e.target.value) })}
            className="w-full sla-slider-blue"
            style={{ background: `linear-gradient(to right, #1e3a8a 0%, #1e3a8a ${pct(targetValue, targetMin, targetMax)}%, #f3f4f6 ${pct(targetValue, targetMin, targetMax)}%, #f3f4f6 100%)` }}
          />
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SLAPage() {
  const { t, i18n } = useTranslation();
  const lang  = i18n.language === "ar" ? "ar" : "en";
  const isRtl = lang === "ar";

  const [originals, setOriginals] = useState<SlaObjective[]>([]);
  const [locals,    setLocals]    = useState<LocalObjective[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [success,   setSuccess]   = useState(false);
  const [showReset, setShowReset] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getSlaObjectives();
      setOriginals(data);
      setLocals(data.map(obj => ({ ...obj, unit: KPI_META[obj.kpiType]?.unit ?? "ratio" })));
    } catch {
      setError(t("settings.genericError"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function updateLocal(kpiType: number, changes: Partial<LocalObjective>) {
    setLocals(prev => prev.map(obj => obj.kpiType === kpiType ? { ...obj, ...changes } : obj));
  }

  async function handleSave() {
    for (const obj of locals) {
      const err = validate(obj);
      if (err) {
        const label = lang === "ar" ? KPI_META[obj.kpiType]?.labelAr : KPI_META[obj.kpiType]?.labelEn;
        setError(`${label}: ${err}`);
        return;
      }
    }

    // Validate ValidityTier cross-tier ordering: targetValue of 11 > 12 > 13 > 14
    const tierTargets = [11, 12, 13, 14].map(t => locals.find(o => o.kpiType === t)?.targetValue ?? 0);
    if (!(tierTargets[0] > tierTargets[1] && tierTargets[1] > tierTargets[2] && tierTargets[2] > tierTargets[3])) {
      setError(lang === "ar"
        ? "الحد الأدنى لـ A يجب أن يكون أكبر من B، وB أكبر من C، وC أكبر من D"
        : "ValidityTier targets must descend: A > B > C > D");
      return;
    }
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const changed = locals.filter(local => {
        const orig = originals.find(o => o.id === local.id);
        return orig && isDirty(orig, local);
      });
      await Promise.all(
        changed.map(obj =>
          updateSlaObjective(obj.id, {
            weight:      obj.weight,
            nearValue:   obj.nearValue,
            targetValue: obj.targetValue,
            limitValue:  obj.limitValue,
            isActive:    obj.isActive,
          })
        )
      );
      setOriginals(locals.map(({ unit: _u, ...rest }) => rest as SlaObjective));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError(t("settings.genericError"));
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setShowReset(false);
    setSaving(true);
    setError(null);
    try {
      await resetSlaObjectives();
      await load();
    } catch {
      setError(t("settings.genericError"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-8xl mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      <div className="mb-6">
        <Breadcrumb pageTitleKey="sla.pageTitle" />
      </div>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">{t("sla.pageTitle")}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{t("sla.subtitle")}</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 font-medium">
          {t("settings.saveSuccess")}
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-zinc-900">{t("sla.setGoals")}</h2>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="w-8 h-8 border-4 border-[#2E75B6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {locals.map(obj => (
            <MetricCard
              key={obj.kpiType}
              obj={obj}
              onChange={changes => updateLocal(obj.kpiType, changes)}
              lang={lang}
            />
          ))}
        </div>
      )}

      {!loading && (
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowReset(true)}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RotateCcw size={14} />
            {isRtl ? "إعادة الضبط" : "Restore Defaults"}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1E3A8A] text-white font-semibold text-sm hover:bg-blue-900/90 transition-colors disabled:opacity-60"
          >
            {saving && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            {saving ? t("team.saving") : t("settings.saveChanges")}
          </button>
        </div>
      )}

      {/* Reset confirm dialog */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="text-base font-bold text-gray-800 mb-2">
              {isRtl ? "إعادة الضبط الافتراضي" : "Restore Defaults"}
            </h3>
            <p className="text-sm text-gray-500 mb-5">
              {isRtl
                ? "سيتم استعادة جميع أهداف SLA إلى قيم المنصة الافتراضية. لا يمكن التراجع عن هذا الإجراء."
                : "All SLA objectives will be reset to platform defaults. This cannot be undone."}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowReset(false)}
                className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {t("settings.cancel")}
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                {isRtl ? "إعادة الضبط" : "Reset"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
