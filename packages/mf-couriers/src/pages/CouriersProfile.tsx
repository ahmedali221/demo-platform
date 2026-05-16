import React, { useEffect, useState } from "react";
import ToolBar from "../components/CourierProfile/ToolBar";
import "../index.css";
import "../lib/i18n";
import CourierMainDetails from "../components/CourierProfile/CourierMainDetails";
import KPI from "../components/CourierProfile/KPI";
import { ForbiddenPage } from "@ops-brain/shared";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getSingleCourier,
  getCourierKpis,
  getCourierLiveStatus,
  getCourierCharts,
  getCourierViolations,
} from "../api/courier.service";
import ViolationDetails from "../components/CourierProfile/ViolationDetails";
import ViolationTypes from "../components/CourierProfile/ViolationTypes";
import { useTranslation } from "react-i18next";
import axios from "axios";
import type {
  CourierProfile,
  CourierKpiSnapshot,
  LiveStatus,
  CourierCharts,
  ViolationsResponse,
} from "../types/Couriers";

export interface CourierPageData {
  profile: CourierProfile;
  kpis: CourierKpiSnapshot[];
  liveStatus: LiveStatus;
  charts: CourierCharts;
  violations: ViolationsResponse;
  violationsActive: ViolationsResponse;
  violationsResolved: ViolationsResponse;
}

const CourierProfile = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState<CourierPageData>();
  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const locationSegments = useLocation().pathname.split("/");
  const courierId = locationSegments[locationSegments.length - 1];

  const fetchAll = async () => {
    if (!courierId) { setLoading(false); return; }
    try {
      const [profile, kpis, liveStatus, charts, violations, violationsActive, violationsResolved] =
        await Promise.all([
          getSingleCourier(courierId),
          getCourierKpis(courierId),
          getCourierLiveStatus(courierId),
          getCourierCharts(courierId),
          getCourierViolations(courierId),
          getCourierViolations(courierId, false),
          getCourierViolations(courierId, true),
        ]);
      setPageData({ profile, kpis, liveStatus, charts, violations, violationsActive, violationsResolved });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        setForbidden(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  if (forbidden) return <ForbiddenPage onGoBack={() => navigate(-1)} dir={i18n.language === "ar" ? "rtl" : "ltr"} />;

  return (
    <div id="courier-profile-root" className="px-5 py-5 2xl:py-10 2xl:px-12 flex-1">
      {loading ? (
        <div className="w-full min-h-[400px] flex items-center justify-center">
          <div className="w-9 h-9 border-4 border-[#1D3478] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : pageData ? (
        <>
          <ToolBar profile={pageData.profile} liveStatus={pageData.liveStatus} />
          <CourierMainDetails
            profile={pageData.profile}
            kpi={pageData.kpis[0]}
            liveStatus={pageData.liveStatus}
            charts={pageData.charts}
          />
          <KPI kpis={pageData.kpis} charts={pageData.charts} />
          <ViolationDetails
            courierId={courierId}
            violations={pageData.violations}
            violationsActive={pageData.violationsActive}
            violationsResolved={pageData.violationsResolved}
            charts={pageData.charts}
          />
          <ViolationTypes />
        </>
      ) : (
        <div className="w-full min-h-[400px] flex flex-col items-center justify-center gap-3 text-neutral-400">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-40">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
          </svg>
          <p className="text-sm font-medium">{t("courier.courierNotFound")}</p>
        </div>
      )}
    </div>
  );
};

export default CourierProfile;
