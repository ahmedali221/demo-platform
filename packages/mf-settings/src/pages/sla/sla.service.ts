import api from "../../shared/axios";

export type Direction = 1 | 2; // 1 = HigherIsBetter, 2 = LowerIsBetter

export interface SlaObjective {
  id: string;
  kpiType: number;
  direction: Direction;
  weight: number;
  nearValue: number;
  targetValue: number;
  limitValue: number;
  isActive: boolean;
}

export interface UpdateSlaPayload {
  weight: number;
  nearValue: number;
  targetValue: number;
  limitValue: number;
  isActive: boolean;
}

export const getSlaObjectives = () =>
  api.get<SlaObjective[]>("/analytics/sla-objectives");

export const updateSlaObjective = (id: string, data: UpdateSlaPayload) =>
  api.put<void>(`/analytics/sla-objectives/${id}`, data);

export const resetSlaObjectives = () =>
  api.post<void>("/analytics/sla-objectives/reset");
