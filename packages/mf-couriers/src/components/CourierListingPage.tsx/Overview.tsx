import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import courier from "../../assets/courier.svg";
import safe from "../../assets/safe.svg";
import follow from "../../assets/follow.svg";
import danger from "../../assets/danger.svg";
import ProgressCard from "./ProgressCard";
import i18n from "../../lib/i18n";
import { formatToday } from "../../lib/utils";
import type { CourierStats } from "../../pages/CouriersPage";

function relativeTime(isoDate: string, lang: string): string {
  const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
  if (diff < 60) return rtf.format(-diff, "second");
  if (diff < 3600) return rtf.format(-Math.floor(diff / 60), "minute");
  if (diff < 86400) return rtf.format(-Math.floor(diff / 3600), "hour");
  return rtf.format(-Math.floor(diff / 86400), "day");
}

interface OverviewProps {
  stats: CourierStats;
  liveStatusAt: string | null;
}

const Overview = ({ stats, liveStatusAt }: OverviewProps) => {
  const { t } = useTranslation();
  const lang = i18n.language;
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row w-full justify-between items-start md:items-center">
        <div className="flex flex-col gap-2 md:gap-4 items-start">
          <p className="text-2xl xl:text-4xl font-bold text-gray-800">
            {t("courier.couriersList")}
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-sm text-[#B3B3B3]">
              {formatToday(lang as "ar" | "en")}
            </span>
            <span className="text-xs text-[#B3B3B3]">•</span>
            <span className="text-sm text-[#B3B3B3]">{t("courier.total")}</span>
            {liveStatusAt != null && (
              <>
                <span className="text-xs text-[#B3B3B3]">•</span>
                <span className="text-sm text-[#B3B3B3]">
                  {t("courier.lastLiveUpdate", { defaultValue: "آخر تحديث للحالة المباشرة" })}
                  {": "}
                  {relativeTime(liveStatusAt, lang)}
                </span>
              </>
            )}
          </div>
          {liveStatusAt == null && (
            <span className="text-xs text-amber-500 font-medium">
              {t("courier.noLiveFile", { defaultValue: "لم يتم رفع ملف المراقبة المباشرة بعد" })}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/couriers/add")}
            className="bg-[#D2A947] text-white rounded-xl flex gap-2 items-center py-2 px-5 font-bold hover:bg-brand/90 transition-colors"
          >
            <span>+</span>
            <span>{t("courier.addCourierBtn")}</span>
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 py-6">
        <ProgressCard
          color="#1D3478"
          title={t("courier.totalCouriers")}
          icon={<img src={courier} alt="Courier" className="h-6 w-6" />}
          description={t("courier.activeToday")}
          goal={{ value: stats.total }}
        />
        <ProgressCard
          color="#27AE60"
          title={t("courier.safe")}
          icon={<img src={safe} alt="Safe" className="h-6 w-6" />}
          description={t("courier.activeToday")}
          goal={{ value: stats.safe }}
        />
        <ProgressCard
          color="#E67E22"
          title={t("courier.needsFollowUp")}
          icon={<img src={follow} alt="Follow" className="h-6 w-6" />}
          description={t("courier.activeToday")}
          goal={{ value: stats.needsFollowUp }}
        />
        <ProgressCard
          color="#C0392B"
          title={t("courier.danger")}
          icon={<img src={danger} alt="Danger" className="h-6 w-6" />}
          description={t("courier.activeToday")}
          goal={{ value: stats.highRisk }}
        />
      </div>
    </>
  );
};

export default Overview;
