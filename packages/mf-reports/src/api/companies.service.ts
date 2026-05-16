import axios from "axios";
import { api } from "../lib/axios";

// ─── Summary (Reports tab) ────────────────────────────────────────────────────

export type PeriodType = 1 | 2 | 3; // 1=Daily, 2=Weekly, 3=Monthly

export interface SummaryParams {
  periodType?: PeriodType;
  from?: string; // yyyy-MM-dd
  to?: string;   // yyyy-MM-dd
  branchId?: string;
}

export interface CompanySummary {
  onTimeRate: number | null;
  cancellationRate: number | null;
  avgDeliveryMin: number | null;
  courierEfficiency: number | null;
  largeOrderOnTimeRate: number | null;
  avgShiftAttendanceRate: number | null;
  avgRejectionRate: number | null;
  operationalEfficiency: number | null;
  activeCouriersCount: number;
  totalWorkingDays: number;
  totalTasksDelivered: number | null;
  totalTasksCancelled: number | null;
  totalTasksRejected: number | null;
}

// Returns null when the API responds 204 (no data for given filters)
export async function getCompanySummary(params?: SummaryParams): Promise<CompanySummary | null> {
  try {
    const res = await api.get<CompanySummary>("/analytics/kpis/company/summary", { params });
    return res.status === 204 ? null : res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) throw error;
      throw new Error(error.response?.data?.message || "Failed to fetch company summary");
    }
    throw error instanceof Error ? error : new Error("Something went wrong");
  }
}

// ─── Live (Live tab) ──────────────────────────────────────────────────────────

export interface CompanyLive {
  snapshotDate: string;
  uploadedAt: string;
  tasksAccepted: number | null;
  tasksDelivered: number | null;
  tasksRejected: number | null;
  capacityTotalRegistered: number | null;
  capacityOnline: number | null;
  capacityScheduled: number | null;
  capacityOnShiftOnline: number | null;
  onTimeRate: number | null;
  cancellationRate: number | null;
  largeOrderOnTimeRate: number | null;
}

export interface LiveParams {
  branchId?: string;
}

// Returns null when the API responds 204 (no live file uploaded yet)
export async function getCompanyLive(params?: LiveParams): Promise<CompanyLive | null> {
  try {
    const res = await api.get<CompanyLive>("/analytics/kpis/company/live", { params });
    return res.status === 204 ? null : res.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) throw error;
      throw new Error(error.response?.data?.message || "Failed to fetch live data");
    }
    throw error instanceof Error ? error : new Error("Something went wrong");
  }
}
