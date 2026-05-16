import axios from "axios";
import { api } from "../lib/axios";

export type PeriodType = 1 | 2 | 3;

export interface CourierPerformanceParams {
  periodType?: PeriodType | null;
  from?: string | null;
  to?: string | null;
  search?: string | null;
  page?: number;
  pageSize?: number;
}

export interface CourierPerformanceSummary {
  totalCouriers: number;
  validCount: number;
  invalidCount: number;
  validityRate: number;
  gradeA: number;
  gradeB: number;
  gradeC: number;
  gradeD: number;
  noLevel: number;
}

export interface CourierPerformanceItem {
  courierId: string;
  courierName: string;
  providerName: string | null;
  totalTasksDelivered: number | null;
  totalTasksCancelledByCourier: number | null;
  totalTasksRejected: number | null;
  onTimeRate: number | null;
  avgCompletionRate: number | null;
  keetaLevel: string | null;
  validityTier: number;
  isValid: boolean;
}

export interface CourierPerformanceResponse {
  summary: CourierPerformanceSummary;
  items: CourierPerformanceItem[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export async function getCourierPerformance(
  params: CourierPerformanceParams = {},
): Promise<CourierPerformanceResponse> {
  try {
    const query: Record<string, unknown> = {
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 20,
    };
    if (params.periodType != null) query.periodType = params.periodType;
    if (params.from) query.from = params.from;
    if (params.to) query.to = params.to;
    if (params.search) query.search = params.search;

    const response = await api.get<CourierPerformanceResponse>(
      "/analytics/couriers/performance",
      { params: query },
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 403) throw error;
        throw new Error(error.response.data?.message || "Failed to fetch courier performance");
      }
      if (error.request) throw new Error("Network or CORS error");
    }
    throw error instanceof Error ? error : new Error("Something went wrong");
  }
}
