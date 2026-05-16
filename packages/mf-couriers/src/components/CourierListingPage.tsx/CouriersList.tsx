import React, { useEffect, useState } from "react";
import search from "../../assets/search.svg";
import StatusFilterTabs from "./StatusFilter";
import { useTranslation } from "react-i18next";
import FilterSelect from "./FilterSelect";
import CourierCard from "./CourierCard";
import { getCourierList, getActivatedProviders } from "../../api/courier.service";
import { Spinner, ForbiddenPage } from "@ops-brain/shared";
import axios from "axios";
import tableBlack from "../../assets/row-verticalblack.svg";
import verticalWhite from "../../assets/verticalWhite.svg";
import cardsWhite from "../../assets/cardsWhite.svg";
import cardsBlack from "../../assets/cardsBlack.svg";
import TableView from "./TableView";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { view } from "../../types/Couriers";
import type { CourierListItem, Provider } from "../../types/Couriers";
import type { CourierStats } from "../../pages/CouriersPage";

interface CouriersListProps {
  onStatsChange?: (s: CourierStats) => void;
  onLiveStatusChange?: (liveStatusAt: string | null) => void;
}

const CouriersList = ({ onStatsChange, onLiveStatusChange }: CouriersListProps) => {
  const [pagination, setPagination] = useState({
    totalPages: 0,
    pageSize: 20,
    page: 1,
    totalCount: 0,
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [riskLevel, setRiskLevel] = useState<number | undefined>(undefined);
  const [providerId, setProviderId] = useState<string | null>(null);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [couriers, setCouriers] = useState<CourierListItem[]>([]);
  const [view, setView] = useState<view>("grid");
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const { t, i18n } = useTranslation();

  // Load activated providers once on mount
  useEffect(() => {
    getActivatedProviders()
      .then(setProviders)
      .catch(() => {});
  }, []);

  const fetchCouriers = async () => {
    setLoading(true);
    try {
      const data = await getCourierList({
        riskLevel,
        providerId: providerId ?? undefined,
        search: searchQuery || undefined,
        page: pagination.page,
        pageSize: pagination.pageSize,
      });

      setCouriers(data.items);
      setPagination(prev => ({
        ...prev,
        totalPages: Math.ceil(data.totalCount / data.pageSize),
        pageSize: data.pageSize,
        totalCount: data.totalCount,
      }));
      onStatsChange?.({
        total: data.summary.totalCouriers,
        safe: data.summary.safeCount,
        needsFollowUp: data.summary.needsFollowUpCount,
        highRisk: data.summary.highRiskCount,
      });
      onLiveStatusChange?.(data.liveStatusAt);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setForbidden(true);
      } else {
        console.error("Error fetching couriers:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouriers();
  }, [riskLevel, providerId, pagination.page]);

  // Search is client-side filtered (debounce not needed for live search on fetched page)
  const filteredCouriers = couriers.filter(courier => {
    if (!searchQuery) return true;
    return courier.courierName.includes(searchQuery);
  });

  const providerOptions: { label: string; value: string | null }[] = [
    { label: t("courier.all-platforms"), value: null },
    ...providers.map(p => ({
      label: i18n.language === "ar" ? p.displayNameAr : p.displayName,
      value: p.id,
    })),
  ];

  if (forbidden) return <ForbiddenPage dir={i18n.language === "ar" ? "rtl" : "ltr"} />;

  return (
    <div className="py-9 w-full">
      <div className="flex gap-15 items-center">
        <div className="flex gap-6 items-center overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <StatusFilterTabs value={riskLevel} onChange={setRiskLevel} />

          <div className="flex gap-3 items-center p-2 border border-[#6B7280] rounded-lg">
            <img src={search} alt="search" />
            <input
              type="text"
              className="bg-transparent outline-none border-none text-sm min-w-60"
              placeholder={t("courier.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Dynamic providers dropdown from /org/providers/activated */}
          <FilterSelect
            value={providerId}
            onChange={(v) => {
              setProviderId(v);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            options={providerOptions}
          />

          <div
            dir="ltr"
            className={`relative px-4 py-2 bg-white rounded-md border border-[#DFDFDF] flex gap-4 before:h-[calc(100%-20px)] before:rounded-md before:w-22 before:content-[''] before:absolute ${view === "table" ? "before:left-[calc(50%+10px)]" : "before:left-4"} before:transition-all before:ease-in-out before:duration-300 before:top-1/2 before:-translate-y-1/2 before:bg-[#1D3478]`}
          >
            <div
              className={`py-2 px-3 ${view === "grid" ? "border-none" : "border"} border-[#DFDFDF] rounded-md flex gap-1 w-22 relative z-2`}
              onClick={() => setView("grid")}
            >
              <img src={view === "grid" ? cardsWhite : cardsBlack} />
              <span className={`text-sm font-bold ${view === "grid" ? "text-white" : "text-black"}`}>
                {t("courier.cards")}
              </span>
            </div>
            <div
              className={`py-2 px-3 ${view === "table" ? "border-none" : "border"} border-[#DFDFDF] rounded-md flex gap-1 w-22 relative z-2`}
              onClick={() => setView("table")}
            >
              <img src={view === "table" ? verticalWhite : tableBlack} />
              <span className={`text-sm font-bold ${view === "table" ? "text-white" : "text-black"}`}>
                {t("courier.table")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="py-9">
        {loading ? (
          <div className="w-full min-h-[200px] flex justify-center items-center">
            <Spinner />
          </div>
        ) : filteredCouriers.length === 0 ? (
          <div className="w-full min-h-[200px] flex flex-col items-center justify-center gap-3 text-neutral-400">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <p className="text-sm font-medium">{t("courier.noCouriersFound")}</p>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCouriers.map((courier, index) => (
              <CourierCard key={courier.courierId || index} courier={courier} />
            ))}
          </div>
        ) : (
          <TableView couriers={filteredCouriers} />
        )}

        <div
          style={
            view === "table"
              ? { borderBottomLeftRadius: 28, borderBottomRightRadius: 28, background: "#2E75B680" }
              : { borderRadius: 28, background: "white", marginTop: 30 }
          }
          className="flex flex-col-reverse items-center justify-between gap-4 px-5 py-5 sm:flex-row"
        >
          <div className="text-base font-semibold text-slate-900 sm:text-sm">
            {t("courier.show")} {(pagination.page - 1) * pagination.pageSize + 1}–{Math.min(pagination.page * pagination.pageSize, pagination.totalCount)}{" "}
            {t("courier.of")} {pagination.totalCount} {t("courier.reports")}
          </div>

          <div className="flex items-center gap-3 text-slate-900">
            <button
              type="button"
              className="rounded-xl p-2 transition hover:bg-white/60 disabled:opacity-40"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1}
              aria-label={t("courier.previousPage")}
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {Array.from({ length: pagination.totalPages }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setPagination(prev => ({ ...prev, page: i + 1 }))}
                className={`flex h-9 w-9 items-center justify-center rounded-sm text-xl font-bold transition ${pagination.page === i + 1
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-slate-900 hover:bg-white/60"
                  }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              type="button"
              className="rounded-xl p-2 transition hover:bg-white/60 disabled:opacity-40"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              aria-label={t("courier.nextPage")}
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouriersList;
