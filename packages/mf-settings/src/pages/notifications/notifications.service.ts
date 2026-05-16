import api from "../../shared/axios";

export interface NotificationSettings {
  inApp: boolean;
  email: boolean;
  sms: boolean;
  thresholdExceeded: boolean;
  commitmentRateDrop: boolean;
  courierAutoDeactivation: boolean;
  importSuccess: boolean;
  fileProcessingFailure: boolean;
  weeklyReportReady: boolean;
  slaReviewReminder: boolean;
}

export const getNotifications = () =>
  api.get<NotificationSettings>("/me/notifications");

export const updateNotifications = (settings: NotificationSettings) =>
  api.put<NotificationSettings>("/me/notifications", settings);
