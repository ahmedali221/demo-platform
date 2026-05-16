export interface ReportStat {
  label: string;
  value: number | null;
  color?: string;
  unit?: string;
}

export interface ReportDetail {
  label: string;
  value: string;
  icon: "calendar" | "user" | "file" | "id";
}

export interface ReportModalConfig {
  detailsLabel?: string;
  details: ReportDetail[];
  alert?: { title: string; description: string };
  pdfLabel?: string;
  csvLabel?: string;
  onDownloadPDF?: () => void;
  onExportCSV?: () => void;
}

export interface ReportCardData {
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
