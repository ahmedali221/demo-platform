import api from "../../shared/axios";

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface Session {
  sessionId: string;
  deviceName: string;
  location: string | null;
  lastActivityAt: string;
  isCurrent: boolean;
}

export const changePassword = (data: ChangePasswordPayload) =>
  api.post("/auth/change-password", data);

export const getSessions = () =>
  api.get("/auth/sessions").then((res) => ({
    ...res,
    data: (res.data.items ?? []).map((s: any) => ({
      sessionId:      s.id,
      deviceName:     s.deviceName,
      location:       s.location ?? null,
      lastActivityAt: s.lastUsedAt,
      isCurrent:      s.isCurrent ?? false,
    })) as Session[],
  }));

export const terminateSession = (sessionId: string) =>
  api.delete(`/auth/sessions/${sessionId}`);

export const terminateAllSessions = () => api.delete("/auth/sessions");
