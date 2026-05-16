import api from "../../shared/axios";
import i18n from "../../lib/i18n";

export interface AdminSession {
  sessionId: string;
  userId: string;
  userEmail: string;
  tenantId: string;
  deviceName: string;
  location: string | null;
  lastActivityAt: string;
}

export const getAdminSessions = () =>
  api.get("/auth/sessions").then((res) => ({
    ...res,
    data: (res.data.items ?? []).map((s: any) => ({
      sessionId:      s.id,
      userId:         s.userId,
      userEmail:      s.userEmail,
      tenantId:       s.tenantId,
      deviceName:     s.deviceName,
      location:       s.location ?? null,
      lastActivityAt: s.lastUsedAt,
    })) as AdminSession[],
  }));

export type Severity = "Success" | "Warning" | "Danger";

export interface ActivityEvent {
  id: string;
  createdAt: string;
  eventType: string;
  title: string;
  subtitle: string | null;
  severity: Severity;
}

function mapSeverity(apiSeverity: string): Severity {
  switch (apiSeverity) {
    case "warning": return "Warning";
    case "error":   return "Danger";
    default:        return "Success"; // "success" and "info"
  }
}

interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export const getActivityLog = (page: number, pageSize: number) =>
  api.get<PagedResult<ActivityEvent>>(
    `/identity/activity-logs?page=${page}&pageSize=${pageSize}`
  ).then((res) => ({
    ...res,
    data: {
      ...res.data,
      items: res.data.items.map((item: any) => {
        const lang = i18n.language === "ar" ? "Ar" : "En";
        return {
          id:        item.id,
          createdAt: item.createdAt,
          eventType: item.eventType,
          severity:  mapSeverity(item.severity),
          title:     item[`title${lang}`]    ?? item.titleEn ?? "",
          subtitle:  item[`subtitle${lang}`] ?? item.subtitleEn ?? null,
        } as ActivityEvent;
      }),
    },
  }));
