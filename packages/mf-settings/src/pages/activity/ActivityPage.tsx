import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight, FileCheck, AlertTriangle, Ban } from "lucide-react";
import Breadcrumb from "../../shared/Breadcrumb";
import "../../lib/i18n";
import "../../index.css";
import { type ActivityEvent, type Severity, getActivityLog } from "./activity.service";

const ITEMS_PER_PAGE = 5;

const FALLBACK_EVENTS: ActivityEvent[] = [
  {
    id: "1",
    createdAt: new Date().toISOString(),
    eventType: "ImportSuccess",
    severity: "Success",
    title: "تم تسجيل الدخول بنجاح",
    subtitle: "دخول من متصفح Chrome على Windows",
  },
  {
    id: "2",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    eventType: "CourierSuspended",
    severity: "Warning",
    title: "تغيير كلمة المرور",
    subtitle: "تم تحديث كلمة المرور قبل ساعة",
  },
  {
    id: "3",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    eventType: "ImportFailure",
    severity: "Danger",
    title: "محاولة دخول فاشلة",
    subtitle: "محاولة دخول من جهاز غير معروف",
  },
  {
    id: "4",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    eventType: "CourierActivated",
    severity: "Success",
    title: "تحديث الملف الشخصي",
    subtitle: "تم تغيير الاسم الأخير",
  },
  {
    id: "5",
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    eventType: "ImportSuccess",
    severity: "Success",
    title: "جلسة جديدة",
    subtitle: "بدء جلسة عمل من تطبيق الجوال",
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// ── Theme maps by severity ─────────────────────────────────────────────────

const timePillTheme: Record<Severity, string> = {
  Success: "bg-green-500/20 text-emerald-800",
  Warning: "bg-orange-500/20 text-orange-500",
  Danger:  "bg-red-500/20   text-red-700",
};

const iconBoxTheme: Record<Severity, string> = {
  Success: "bg-sky-600/20",
  Warning: "bg-amber-300/25",
  Danger:  "bg-orange-700/20",
};

const IconBySeverity = ({ severity }: { severity: Severity }) => {
  if (severity === "Success")
    return <FileCheck size={24} className="text-blue-900" />;
  if (severity === "Warning")
    return <AlertTriangle size={24} className="text-amber-500" />;
  return <Ban size={24} className="text-red-700" />;
};

// ── Row ───────────────────────────────────────────────────────────────────

function localizeSubtitle(subtitle: string, recordsLabel: string): string {
  return subtitle.replace(/\brecords\b/gi, recordsLabel);
}

function EventRow({ event }: { event: ActivityEvent }) {
  const { t } = useTranslation();
  const subtitle = event.subtitle
    ? localizeSubtitle(event.subtitle, t("activity.records"))
    : null;
  return (
    <div className=" h-20 border-t border-gray-100 inline-flex justify-between items-center">
      {/* Right: icon + title + subtitle */}
      <div className="flex  items-center gap-3 px-4">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBoxTheme[event.severity]}`}>
          <IconBySeverity severity={event.severity} />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-black font-['Cairo'] leading-5 ">
            {event.title}
          </span>
          {subtitle && (
            <span className="text-xs font-semibold text-slate-400 font-['Cairo'] leading-4 ">
              {subtitle}
            </span>
          )}
        </div>
      </div>
      {/* Left: date + time pills */}
      <div className="h-20 px-4 flex  items-center gap-1.5">
        <div className="w-14 p-1 rounded-full outline outline-1 outline-offset-[-1px] outline-gray-200 flex justify-center items-center">
          <span className="text-[10px] font-medium text-neutral-400 uppercase leading-4 font-['Inter']">
            {formatDate(event.createdAt)}
          </span>
        </div>
        <div className={`w-14 p-1 rounded-full outline outline-1 outline-offset-[-1px] outline-transparent flex justify-center items-center ${timePillTheme[event.severity]}`}>
          <span className="text-[10px] font-black uppercase leading-4 font-['Cairo']">
            {formatTime(event.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function ActivityPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);
    getActivityLog(page, ITEMS_PER_PAGE)
      .then(({ data }) => {
        setEvents(data.items);
        setHasMore(data.totalCount > page * ITEMS_PER_PAGE);
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          setEvents(FALLBACK_EVENTS);
          setHasMore(false);
        } else {
          setError(t("activity.errorLoad"));
        }
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="p-6 mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      {/* Breadcrumb */}
      <div className="mb-6">
        <Breadcrumb pageTitleKey="activity.pageTitle" />
      </div>

      {/* Page title */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-800">{t("activity.heading")}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{t("activity.subheading")}</p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl overflow-hidden">
        {/* Card header */}
        <div className="flex items-center  px-6 py-4">
          <h2 className="text-xl font-bold text-black font-['Cairo'] leading-5">
            {t("activity.heading")}
          </h2>
        </div>

        {/* Body */}
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            <div className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-gray-200 border-t-[#2E75B6] rounded-full animate-spin" />
              {t("activity.loading")}
            </div>
          </div>
        ) : error ? (
          <div className="px-6 py-10 text-center text-sm text-red-400">{error}</div>
        ) : events.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">{t("activity.empty")}</div>
        ) : (
          <div className="flex flex-col">
            {events.map((event) => (
              <EventRow key={event.id} event={event} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && (page > 1 || hasMore) && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {isRtl ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
              {t("activity.prev")}
            </button>
            <span className="text-xs text-gray-400">{page}</span>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              {t("activity.next")}
              {isRtl ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
