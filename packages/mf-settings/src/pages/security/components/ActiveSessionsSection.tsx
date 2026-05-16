import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSessions, terminateSession, terminateAllSessions, type Session } from "../security.service";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 3;

export default function ActiveSessionsSection() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [page, setPage]         = useState(1);

  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { data } = await getSessions();
      setSessions(data);
    } catch {
      setError(t("activity.errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  const handleTerminate = async (sessionId: string, isCurrent: boolean) => {
    if (isCurrent && !window.confirm(t("settings.confirmTerminateCurrent"))) return;
    try {
      await terminateSession(sessionId);
      if (isCurrent) {
        navigate("/login");
      } else {
        setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId));
      }
    } catch {
      alert(t("settings.errorTerminate"));
    }
  };

  const handleTerminateAll = async () => {
    if (!window.confirm(t("settings.confirmTerminateAll"))) return;
    try {
      await terminateAllSessions();
      navigate("/login");
    } catch {
      alert(t("settings.errorTerminate"));
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const diff = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (diff < 60)    return t("settings.now");
    if (diff < 3600)  return t("settings.minutesAgo", { count: Math.floor(diff / 60) });
    if (diff < 86400) return t("settings.hoursAgo",   { count: Math.floor(diff / 3600) });
    return t("settings.daysAgo", { count: Math.floor(diff / 86400) });
  };

  const totalPages = Math.max(1, Math.ceil(sessions.length / PAGE_SIZE));
  const pageItems  = sessions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-gray-50/70 border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1 h-4 rounded-full bg-green-400" />
          <div>
            <h2 className="text-sm font-semibold text-gray-700">{t("settings.activeSessions")}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {t("settings.activeDevices", { count: sessions.length })}
            </p>
          </div>
        </div>
        <button
          onClick={handleTerminateAll}
          className="px-4 py-1.5 text-xs font-semibold border border-red-200 text-red-400 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all"
        >
          {t("settings.terminateAll")}
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/40">
              <th className="py-2.5 px-4 text-start text-xs font-semibold text-gray-400 uppercase tracking-wide">{t("settings.sessionDevice")}</th>
              <th className="py-2.5 px-4 text-start text-xs font-semibold text-gray-400 uppercase tracking-wide">{t("settings.sessionLastActivity")}</th>
              <th className="py-2.5 px-4 text-start text-xs font-semibold text-gray-400 uppercase tracking-wide">{t("settings.sessionLocation")}</th>
              <th className="py-2.5 px-4 text-start text-xs font-semibold text-gray-400 uppercase tracking-wide">{t("settings.sessionStatus")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-gray-200 border-t-[#2E75B6] rounded-full animate-spin" />
                    {t("activity.loading")}
                  </div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-red-400">{error}</td>
              </tr>
            ) : sessions.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">{t("activity.empty")}</td>
              </tr>
            ) : (
              pageItems.map((session) => (
                <tr key={session.sessionId} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3.5 px-4 text-xs font-medium text-gray-700">{session.deviceName}</td>
                  <td className="py-3.5 px-4 text-xs text-gray-400">{formatRelativeTime(session.lastActivityAt)}</td>
                  <td className="py-3.5 px-4 text-xs text-gray-500">{session.location || "—"}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      {session.isCurrent && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-600 border border-green-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                          {t("settings.current")}
                        </span>
                      )}
                      <button
                        onClick={() => handleTerminate(session.sessionId, session.isCurrent)}
                        className="px-3 py-1 text-xs font-semibold border border-red-200 text-red-400 rounded-lg hover:bg-red-50 hover:border-red-300 transition-all"
                      >
                        {t("settings.terminate")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-2.5 border-t border-gray-100 shrink-0">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {isRtl ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
            {t("activity.prev")}
          </button>
          <span className="text-xs text-gray-400">{page} / {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 text-xs font-semibold text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            {t("activity.next")}
            {isRtl ? <ChevronLeft size={13} /> : <ChevronRight size={13} />}
          </button>
        </div>
      )}
    </div>
  );
}
