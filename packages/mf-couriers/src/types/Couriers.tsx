export type view = "grid" | "table";

export type ViolationTone = "Green" | "Yellow" | "Red";

// ── New API types (/analytics/couriers) ──────────────────────────────────────

export interface CourierListItem {
  courierId: string;
  courierName: string;
  externalId: string | null;
  providerName: string | null;
  riskLevel: 1 | 2 | 3;
  onShift: boolean | null;
  currentlyOnline: boolean | null;
  keetaLevel: string | null;
  totalTasksDelivered: number | null;
  performanceScore: number;
  violationCount30d: number;
  latestEscalationAction: number | null;
}

export interface CourierListSummary {
  totalCouriers: number;
  safeCount: number;
  needsFollowUpCount: number;
  highRiskCount: number;
}

export interface CourierListResponse {
  summary: CourierListSummary;
  items: CourierListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  liveStatusAt: string | null;
}

export interface Provider {
  id: string;
  type: number;
  key: string;
  displayName: string;
  displayNameAr: string;
  logoUrl: string | null;
  isActive: boolean;
}
export type DeliveryMetrics = {
  onTimeDeliveryRate: number;
  onlineHoursToday: number | null;
  ordersPerHour: number | null;
  faceRecognitionRate: number | null;
  advanceDeliveryRate: number;
  rejectionRate: number;
  cancellationRate: number;
  vdaIsValid: boolean;
  completedOrdersCount: number;
  deliveryIssueCancelledCount: number;
  deliveryIssueCancelledIsEstimated: boolean;
  rejectedOrdersCount: number | null;
  estimatedLevel: string;
  avgValidHoursPerShift: number | null;
  advanceDeliveryRateComputed: number | null;
  performanceTrend7Days: unknown[];
  dailyOrders7Days: unknown[];
  dailyOrdersPerHourToday: number | null;
};
export type { CourierCardData } from "@ops-brain/shared";

// ── New v1 API types ──────────────────────────────────────────────────────────

export interface ExternalAccount {
  id: string;
  providerId: string;
  externalId: string;
  externalName: string;
  isVerified: boolean;
  isActive: boolean;
  linkedAt: string;
}

export interface CourierProfile {
  id: string;
  courierCode: string;
  firstName: string;
  lastName: string;
  appPhone: string;
  absherPhone: string;
  email: string;
  dateOfBirth: string;
  idNumber: string;
  cityId: string;
  branchId: string;
  assignedShift: string;
  createdAt: string;
  currentRiskLevel: number;
  externalAccounts: ExternalAccount[];
}

export interface CourierKpiSnapshot {
  id: string;
  courierId: string;
  periodStart: string;
  periodEnd: string;
  totalTasksAccepted: number;
  totalTasksDelivered: number;
  totalTasksRejected: number;
  totalTasksRejectedAuto: number;
  acceptanceRate: number;
  avgCancellationRate: number;
  avgCompletionRate: number;
  onTimeRate: number;
  avgDeliveryTimeMin: number;
  largeOrderOnTimeRate: number;
  over55MinProp: number;
  courierEfficiency: number;
  rankLevel: string | null;
  rankScore: number;
  rankRewardAmount: number;
  riskLevel: number;
  recommendedAction: number;
  validityTier: number;
  performanceScore: number;
  calculatedAt: string;
}

export interface LiveStatus {
  currentlyOnline: boolean | null;
  onShift: boolean | null;
  lastSeenAt: string | null;
}

export interface DailyDataPoint {
  date: string;
  value: number;
}

export interface CourierCharts {
  dailyOrders: DailyDataPoint[];
  dailyOnlineHours: DailyDataPoint[];
  validDaysThisMonth: number;
  avgOnlineHoursPerDay: number | null;
  continuousDecline: boolean;
}

export interface ViolationItem {
  id: string;
  tenantId: string;
  courierId: string;
  violationType: number;
  escalationAction: number;
  count: number;
  shiftDate: string;
  occurredAt: string;
  detectionSource: string;
  isResolved: boolean;
  resolvedAt: string | null;
}

export interface ViolationsResponse {
  items: ViolationItem[];
  total: number;
}
export interface ViolationStyle {
  text: string;
  icon: React.ReactNode;
}

export interface StatProps {
  label: string;
  value: React.ReactNode;
  valueClass?: string;
}
export interface CityOption {
  id: string;
  name: string;
  nameAr: string;
  countryCode: string;
}

export interface BranchOption {
  id: string;
  nameAr: string;
  nameEn: string;
  cityId: string;
  isActive: boolean;
}

export interface SupervisorOption {
  id: string;
  fullName: string;
}

export interface CouriersLookupsResponse {
  cities: CityOption[];
  branches: BranchOption[];
  providers: Provider[];
  supervisors: SupervisorOption[];
}

export interface CreateCourierPayload {
  firstName: string;
  lastName: string;
  appPhone?: string;
  absherPhone?: string;
  email?: string;
  dateOfBirth?: string;
  idType?: number;
  idNumber?: string;
  idExpiryDate?: string;
  idImageUrl?: string;
  cityId?: string;
  branchId?: string;
  address?: string;
  providerId?: string;
  externalId?: string;
  externalName?: string;
  supervisorId?: string;
  workStartDate?: string;
  licenseType?: number;
  licenseNumber?: string;
  licenseExpiryDate?: string;
  licenseImageUrl?: string;
  vehicleType?: number;
  contractType?: number;
  operationCardNumber?: string;
  operationCardExpiry?: string;
  plateNumber?: string;
  vehicleSerialNumber?: string;
  assignedShift?: string;
  notes?: string;
}

export interface Violation {
  count: number;
  courierId: string;
  detectionSource: string;
  escalationAction: number;
  id: string;
  isResolved: boolean;
  occurredAt: string;
  resolvedAt: string | null;
  shiftDate: string;
  violationType: number;
}
