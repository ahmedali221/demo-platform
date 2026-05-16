import React from "react";
import back from "../../assets/back-arrow.svg";
import doc from "../../assets/document.svg";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import * as XLSX from "xlsx";
import type { CourierProfile, LiveStatus } from "../../types/Couriers";

const RISK_LABEL: Record<number, string> = { 1: "أداء جيد", 2: "يحتاج متابعة", 3: "أداء منخفض" };

const ToolBar = ({ profile, liveStatus }: { profile: CourierProfile; liveStatus: LiveStatus }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fullName = `${profile.firstName} ${profile.lastName}`;
  const activeAccount = profile.externalAccounts.find((a) => a.isActive) ?? profile.externalAccounts[0];

  const handleExportPDF = async () => {
    const element = document.getElementById("courier-profile-root");
    if (!element) return;
    const imgData = await toPng(element, { pixelRatio: 2 });
    const img = new Image();
    img.src = imgData;
    await new Promise((resolve) => { img.onload = resolve; });
    const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (img.height * pageWidth) / img.width;
    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, pageWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(`courier-${fullName}.pdf`);
  };

  const handleExportExcel = () => {
    const rows = [
      { [t("courier.courier")]: fullName },
      { [t("courier.courier")]: activeAccount?.externalId ?? "—" },
      { [t("courier.platform")]: activeAccount?.providerId ?? "—" },
      { [t("courier.dangerLevel")]: RISK_LABEL[profile.currentRiskLevel] ?? "—" },
      { [t("courier.status")]: liveStatus.currentlyOnline ? t("courier.online") : t("courier.offline") },
    ];
    const exportData = rows.reduce<Record<string, string | number>>((acc, row) => {
      const [key, value] = Object.entries(row)[0];
      acc[key] = value as string | number;
      return acc;
    }, {});
    const worksheet = XLSX.utils.json_to_sheet([exportData]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Courier");
    XLSX.writeFile(workbook, `courier-${fullName}.xlsx`);
  };

  return (
    <div className="flex items-center justify-between gap-4 mb-6">
      <div className="flex gap-5 items-end">
        <div
          className="flex gap-2 text-xl font-bold text-[#201B13] cursor-pointer"
          onClick={() => navigate("/couriers")}
        >
          <img src={back} />
          <span>{t("courier.back")}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-sm text-[#A2A2A2]">{t("courier.couriers")}</span>
          <span className="text-[#64748B] text-sm">/</span>
          <span className="text-[#64748B] text-sm text-bold">{fullName}</span>
        </div>
      </div>
      <div className="flex gap-4">
        <div
          onClick={handleExportExcel}
          className="flex gap-2 py-1.5 px-4 rounded-lg w-fit text-[#1D3478] font-semibold text-sm bg-white border border-[#1D3478] cursor-pointer hover:bg-[#1D3478]/10 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="8" y1="13" x2="16" y2="13" />
            <line x1="8" y1="17" x2="16" y2="17" />
            <line x1="10" y1="9" x2="8" y2="9" />
          </svg>
          <span className="text-nowrap">{t("courier.reportExcel")}</span>
        </div>
        <div
          onClick={handleExportPDF}
          className="flex gap-2 py-1.5 px-4 rounded-lg w-fit text-white font-semibold text-sm bg-[#1D3478] cursor-pointer hover:bg-[#1D3478]/80 transition-colors"
        >
          <img src={doc} />
          <span className="text-nowrap">{t("courier.reportPDF")}</span>
        </div>
      </div>
    </div>
  );
};

export default ToolBar;
