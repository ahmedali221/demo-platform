import React, { useState } from "react";
import Overview from "../components/CourierListingPage.tsx/Overview";
import "../index.css";
import "../lib/i18n";
import CouriersList from "../components/CourierListingPage.tsx/CouriersList";

export interface CourierStats {
  total: number;
  safe: number;
  needsFollowUp: number;
  highRisk: number;
}

const CouriersPage = () => {
  const [stats, setStats] = useState<CourierStats>({
    total: 0,
    safe: 0,
    needsFollowUp: 0,
    highRisk: 0,
  });
  const [liveStatusAt, setLiveStatusAt] = useState<string | null>(null);

  return (
    <div className="px-5 py-5 xl:py-10 xl:px-12 flex-1">
      <Overview stats={stats} liveStatusAt={liveStatusAt} />
      <CouriersList onStatsChange={setStats} onLiveStatusChange={setLiveStatusAt} />
    </div>
  );
};

export default CouriersPage;
