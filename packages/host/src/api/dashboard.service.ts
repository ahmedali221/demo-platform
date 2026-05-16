import axios from "axios";
import { api } from "../lib/axios";
import { DashboardMetrics } from "../types/dashboard";
export const getShiftData = async () => {
  const response = await api.get("/dashboard/shift-data");
  return response.data;
};

export const getFleetData = async (from?: string, to?: string): Promise<DashboardMetrics> => {
  try {
    const response = await api.get("/dashboard/fleet-kpi", {
      params: { from, to },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "forgotPassword.error");
      }
      if (error.request) {
        throw new Error("Network or CORS error");
      }
    }
    throw error instanceof Error ? error : new Error("forgotPassword.error");
  }
};

export const getCourierRanking = async () => {
  const response = await api.get("/dashboard/courier-ranking");
  return response.data;
};

export const getCourierRankLevels = async () => {
  const response = await api.get("/dashboard/courier-rank-levels");
  return response.data;
};

export const getViolationsProviders = async () => {
  const response = await api.get("/violations/providers");
  return response.data;
};

export const getViolationsCounter = async (provider?: number) => {
  const params = provider !== undefined ? { provider } : {};
  const response = await api.get("/violations/counter", { params });
  return response.data;
};

export interface AutoAlertDto {
  severity: "Danger" | "Warning";
  type: "OnTimeDelivery" | "RejectionRate" | "ShiftAttendance" | "ShiftPeriodExceeded" | "ExpiringDocuments";
  currentValue: number | null;
  threshold: number | null;
  shiftName: string | null;
  count: number | null;
}

export const getAutoAlerts = async (): Promise<AutoAlertDto[]> => {
  const response = await api.get("/dashboard/auto-alerts");
  return response.data;
};
