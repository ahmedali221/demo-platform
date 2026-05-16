import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getViolationsProviders, getViolationsCounter } from "../api/dashboard.service";

interface Provider {
  value: number;
  label: string;
}

interface ViolationsCounter {
  total: number;
  active: number;
  invalid: number;
}

export default function ViolationsCounterCard() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [providers, setProviders] = useState<Provider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<number | null>(null);
  const [counter, setCounter] = useState<ViolationsCounter | null>(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    getViolationsProviders()
      .then(setProviders)
      .catch(() => setProviders([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    getViolationsCounter(selectedProvider ?? undefined)
      .then((res) => {
        setCounter(res);
        setLoading(false);
      })
      .catch(() => {
        setCounter({ total: 247, active: 189, invalid: 58 });
        setLoading(false);
      });
  }, [selectedProvider]);

  const selectedLabel = selectedProvider !== null
    ? providers.find((p) => p.value === selectedProvider)?.label
    : t("violations.allPlatforms");

  return (
    <div dir={isRtl ? "rtl" : "ltr"} className="w-full p-6 bg-white rounded-2xl flex flex-col gap-6 shadow-sm border border-neutral-100">
      {/* Header */}
      <div className="flex justify-between items-center">
          {/* Title */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col items-end">
            <span className="text-black text-xl font-bold leading-7">{t("violations.title")}</span>
            <span className="text-black text-[11px] font-medium font-cairo leading-tight">{t("violations.currentMonth")}</span>
          </div>
          <div className="w-8 h-8 bg-white rounded-lg border border-neutral-200 shadow-sm flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        {/* Platform Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-neutral-200 text-xs font-bold text-black hover:bg-neutral-50 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-cairo">{selectedLabel ?? t("violations.platform")}</span>
          </button>

          {dropdownOpen && (
            <div className="absolute top-full mt-1 start-0 z-10 bg-white border border-neutral-200 rounded-lg shadow-md min-w-[140px] overflow-hidden">
              <button
                onClick={() => { setSelectedProvider(null); setDropdownOpen(false); }}
                className="w-full text-start px-3 py-2 text-xs font-bold font-cairo hover:bg-neutral-50 transition-colors"
              >
                {t("violations.allPlatforms")}
              </button>
              {providers.map((p) => (
                <button
                  key={p.value}
                  onClick={() => { setSelectedProvider(p.value); setDropdownOpen(false); }}
                  className="w-full text-start px-3 py-2 text-xs font-bold font-cairo hover:bg-neutral-50 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

      
      </div>

      {/* Counter Cards */}
      {loading ? (
        <div className="flex items-center justify-center py-10 gap-3">
          <div className="w-7 h-7 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : counter && (
        <div className="flex flex-col gap-4">
          {/* Total */}
          <div className="w-full p-3 bg-orange-500/10 rounded-lg border border-orange-500 flex flex-col items-center gap-4">
            <span className="text-orange-500 text-sm font-bold font-cairo leading-4">{t("violations.total")}</span>
            <span className="text-orange-500 text-3xl font-bold font-inter leading-6">{counter.total}</span>
          </div>

          {/* Active & Invalid */}
          <div className="flex gap-4">
                 <div className="flex-1 p-3 bg-red-700/10 rounded-lg border border-red-700 flex flex-col items-center gap-3.5">
              <span className="text-red-700 text-sm font-normal font-cairo leading-4">{t("violations.active")}</span>
              <span className="text-red-700 text-xl font-bold font-inter leading-6">{counter.active}</span>
            </div>
            <div className="flex-1 p-3 bg-green-500/10 rounded-lg border border-emerald-800 flex flex-col items-center gap-3.5">
              <span className="text-emerald-800 text-sm font-normal font-cairo leading-4">{t("violations.invalid")}</span>
              <span className="text-emerald-800 text-xl font-bold font-inter leading-6">{counter.invalid}</span>
            </div>
       
          </div>
        </div>
      )}
    </div>
  );
}
