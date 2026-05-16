import axios from "axios";
import { api } from "../lib/axios";

export type PeriodFilter = "monthly" | "weekly" | "daily" | "all";
export type KpiStatus = "WithinTarget" | "BelowTarget" | "ExceededLimit";

export interface CompanyOrderStats {
  totalCompleted: number;
  totalCancelled: number;
  totalRejected: number;
}

export interface CompanyKpiDto {
  key: string;
  value: number | null;
  unit: string | null;
  status: KpiStatus;
}

export interface CompanyOverviewResponse {
  period: PeriodFilter;
  dateFrom: string | null;
  dateTo: string | null;
  orderStats: CompanyOrderStats;
  kpis: CompanyKpiDto[];
}

export async function getCompanyOverview(period: PeriodFilter = "monthly"): Promise<CompanyOverviewResponse> {
  try {
    const response = await api.get<CompanyOverviewResponse>("/reports/company-overview", {
      params: { period }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 403) throw error; // let the page detect 403
        throw new Error(error.response.data?.message || "Failed to fetch company overview");
      }
      if (error.request) {
        throw new Error("Network or CORS error");
      }
    }
    throw error instanceof Error ? error : new Error("Something went wrong");
  }
}
