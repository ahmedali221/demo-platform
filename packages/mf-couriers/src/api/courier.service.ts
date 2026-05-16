import axios from "axios";
import { api } from "../lib/axios";
import type {
  CourierListResponse,
  CreateCourierPayload,
  Provider,
  CourierProfile,
  CourierKpiSnapshot,
  LiveStatus,
  CourierCharts,
  ViolationsResponse,
} from "../types/Couriers";

export const getCourierList = async (params: {
  riskLevel?: number;
  providerId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<CourierListResponse> => {
  const query = new URLSearchParams();
  if (params.riskLevel != null) query.set("riskLevel", String(params.riskLevel));
  if (params.providerId) query.set("providerId", params.providerId);
  if (params.search) query.set("search", params.search);
  if (params.page != null) query.set("page", String(params.page));
  if (params.pageSize != null) query.set("pageSize", String(params.pageSize));

  try {
    const response = await api.get<CourierListResponse>(`/analytics/couriers?${query.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) throw error;
      throw new Error(error.response?.data?.message || "couriers.error");
    }
    throw error instanceof Error ? error : new Error("Something went wrong");
  }
};

export const getActivatedProviders = async (): Promise<Provider[]> => {
  try {
    const response = await api.get<Provider[]>("/org/providers/activated");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "couriers.error");
    }
    throw error instanceof Error ? error : new Error("Something went wrong");
  }
};

export const getCouriers = async (
  search?: string,
  shift?: number,
  provider?: number,
  riskLevel?: number,
  page = 1,
) => {
  try {
    const response = await api.get(
      `/couriers/external?${search ? `search=${search}` : ""}${provider ? `&provider=${provider}` : ""}${shift ? `&status=${shift}` : ""}${riskLevel ? `&riskLevel=${riskLevel}` : ""}&page=${page}`,
    );
    if (!response.status) {
      throw new Error("couriers.error");
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status === 403) throw error; // let the caller detect 403
        throw new Error(error.response.data?.message || "couriers.error");
      }

      if (error.request) {
        throw new Error("Network or CORS error");
      }
    }

    throw error instanceof Error ? error : new Error("SomeThing wrong happend");
  }
};
export const getSingleCourier = async (id: string): Promise<CourierProfile> => {
  try {
    const response = await api.get<CourierProfile>(`/v1/couriers/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) throw error;
      throw new Error(error.response?.data?.message || "couriers.error");
    }
    throw error instanceof Error ? error : new Error("Something went wrong");
  }
};

export const getCourierKpis = async (id: string): Promise<CourierKpiSnapshot[]> => {
  try {
    const response = await api.get<CourierKpiSnapshot[]>(`/v1/analytics/kpis/courier/${id}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) throw error;
      throw new Error(error.response?.data?.message || "couriers.error");
    }
    throw error instanceof Error ? error : new Error("Something went wrong");
  }
};

export const getCourierLiveStatus = async (id: string): Promise<LiveStatus> => {
  try {
    const response = await api.get<LiveStatus>(`/v1/analytics/courier/${id}/live-status`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) throw error;
      throw new Error(error.response?.data?.message || "couriers.error");
    }
    throw error instanceof Error ? error : new Error("Something went wrong");
  }
};

export const getCourierCharts = async (id: string): Promise<CourierCharts> => {
  try {
    const response = await api.get<CourierCharts>(`/v1/analytics/courier/${id}/charts`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) throw error;
      throw new Error(error.response?.data?.message || "couriers.error");
    }
    throw error instanceof Error ? error : new Error("Something went wrong");
  }
};
export const getCities = async () => {
  try {
    const response = await api.get("/ref/cities");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "couriers.error");
    }
    throw error instanceof Error ? error : new Error("Something went wrong");
  }
};

export const getBranches = async () => {
  try {
    const response = await api.get("/org/branches", { params: { isActive: true } });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "couriers.error");
    }
    throw error instanceof Error ? error : new Error("Something went wrong");
  }
};

export const getSupervisors = async () => {
  try {
    const response = await api.get("/identity/users/supervisors");
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || "couriers.error");
    }
    throw error instanceof Error ? error : new Error("Something went wrong");
  }
};

export const getCourierLookups = async () => {
  const [cities, branches, providers, supervisors] = await Promise.all([
    getCities(),
    getBranches(),
    getActivatedProviders(),
    getSupervisors(),
  ]);
  return { cities, branches, providers, supervisors };
};

export const createCourier = async (payload: CreateCourierPayload) => {
  try {
    const response = await api.post("/couriers", payload);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(error.response.data?.message || "couriers.error");
      }
      if (error.request) {
        throw new Error("Network or CORS error");
      }
    }
    throw error instanceof Error ? error : new Error("SomeThing wrong happend");
  }
};

export const getCourierViolations = async (
  courierId: string,
  isResolved?: boolean,
  page = 1,
  pageSize = 100,
): Promise<ViolationsResponse> => {
  const query = new URLSearchParams({ courierId, page: String(page), pageSize: String(pageSize) });
  if (isResolved !== undefined) query.set("isResolved", String(isResolved));
  try {
    const response = await api.get<ViolationsResponse>(`/v1/violations?${query.toString()}`);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 403) throw error;
      throw new Error(error.response?.data?.message || "couriers.error");
    }
    throw error instanceof Error ? error : new Error("Something went wrong");
  }
};
