import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  User,
  Phone,
  Mail,
  Calendar,
  MapPin,
  Map,
  CreditCard,
  Hash,
  Monitor,
  Car,
  UserCheck,
  FileText,
  Key,
  Settings,
} from "lucide-react";
import type { Step1Form } from "./Step1PersonalInfo";
import type { Step2Form } from "./Step2WorkVehicle";
import { CouriersLookupsResponse } from "../../types/Couriers";

const ID_TYPE_LABELS: Record<number, string> = { 1: "هوية وطنية", 2: "إقامة", 3: "جواز سفر" };
const VEHICLE_TYPE_LABELS: Record<number, string> = { 1: "سيارة", 2: "دراجة نارية", 3: "شاحنة" };
const CONTRACT_TYPE_LABELS: Record<number, string> = { 1: "تأجير تمويلي", 2: "تأجير تشغيلي", 3: "ملك الشركة", 4: "ملك المندوب" };

interface ReviewRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const ReviewRow = ({ icon, label, value }: ReviewRowProps) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <div className="flex items-center gap-1.5">
      <div className="w-4 h-4 text-gray-400 shrink-0">{icon}</div>
      <span className="text-xs font-medium font-['Cairo'] text-gray-500">
        {label}
      </span>
    </div>
    <span
      className={`text-sm font-normal font-['Cairo'] ${value ? "text-gray-800" : "text-neutral-400"}`}
    >
      {value || "—"}
    </span>
  </div>
);

const ReviewCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="flex-1 p-6 bg-white rounded-2xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col gap-1 min-h-[420px]">
    <div className="flex items-center gap-2 mb-4">
      <span className="text-lg font-bold font-['Cairo'] text-zinc-900">
        {title}
      </span>
      <div className="w-5 h-5 text-zinc-900">{icon}</div>
    </div>
    {children}
  </div>
);

const ReviewStep = ({
  lookups,
  step1,
  step2,
}: {
  lookups: CouriersLookupsResponse;

  step1: Step1Form;
  step2: Step2Form;
}) => {
  const { t } = useTranslation();

  const completion = useMemo(() => {
    const allFields: (string | number | File | null)[] = [
      step1.fullName,
      step1.email,
      step1.appPhone,
      step1.idType,
      step1.idNumber,
      step1.idExpiryDate,
      step1.cityId,
      step1.address,
      step2.provider,
      step2.vehicle.vehicleType,
      step2.workStartDate,
      step2.supervisorId,
      step2.vehicle.vehicleContract,
      step2.licenseNumber,
      step2.licenseExpiry,
      step2.vehicle.operationCardNumber,
    ];
    const filled = allFields.filter((v) => v !== "" && v !== null).length;
    return Math.round((filled / allFields.length) * 100);
  }, [step1, step2]);

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* Two review cards side by side */}
      <div className="flex gap-4 items-start">
        {/* Personal Data */}
        <ReviewCard
          title={t("courier.add.review.personalData")}
          icon={<User className="w-5 h-5" />}
        >
          <ReviewRow
            icon={<User className="w-4 h-4" />}
            label={t("courier.add.fullName")}
            value={step1.fullName}
          />
          <ReviewRow
            icon={<Phone className="w-4 h-4" />}
            label={t("courier.add.phone")}
            value={step1.appPhone}
          />
          <ReviewRow
            icon={<Mail className="w-4 h-4" />}
            label={t("courier.add.email")}
            value={step1.email}
          />
          <ReviewRow
            icon={<Calendar className="w-4 h-4" />}
            label={t("courier.add.idExpiry")}
            value={step1.idExpiryDate}
          />
          <ReviewRow
            icon={<MapPin className="w-4 h-4" />}
            label={t("courier.add.city")}
            value={lookups.cities.find((o) => o.id == step1.cityId)?.nameAr || lookups.cities.find((o) => o.id == step1.cityId)?.name || ""}
          />
          <ReviewRow
            icon={<Map className="w-4 h-4" />}
            label={t("courier.add.address")}
            value={step1.address}
          />
          <ReviewRow
            icon={<CreditCard className="w-4 h-4" />}
            label={t("courier.add.idType")}
            value={step1.idType ? (ID_TYPE_LABELS[step1.idType] ?? String(step1.idType)) : ""}
          />
          <ReviewRow
            icon={<Hash className="w-4 h-4" />}
            label={t("courier.add.idNumber")}
            value={step1.idNumber}
          />
        </ReviewCard>

        {/* Work Data */}
        <ReviewCard
          title={t("courier.add.review.workData")}
          icon={<Settings className="w-5 h-5" />}
        >
          <ReviewRow
            icon={<Monitor className="w-4 h-4" />}
            label={t("courier.add.platform")}
            value={
              lookups.providers.find((p) => p.id == step2.provider)?.displayNameAr ||
              lookups.providers.find((p) => p.id == step2.provider)?.displayName ||
              ""
            }
          />
          <ReviewRow
            icon={<Car className="w-4 h-4" />}
            label={t("courier.add.transportMode")}
            value={step2.vehicle.vehicleType ? (VEHICLE_TYPE_LABELS[Number(step2.vehicle.vehicleType)] ?? "") : ""}
          />
          <ReviewRow
            icon={<Calendar className="w-4 h-4" />}
            label={t("courier.add.workStartDate")}
            value={step2.workStartDate}
          />
          <ReviewRow
            icon={<UserCheck className="w-4 h-4" />}
            label={t("courier.add.supervisor")}
            value={lookups.supervisors.find((s) => s.id == step2.supervisorId)?.fullName || ""}
          />
          <ReviewRow
            icon={<FileText className="w-4 h-4" />}
            label={t("courier.add.vehicleContract")}
            value={step2.vehicle.vehicleContract ? (CONTRACT_TYPE_LABELS[Number(step2.vehicle.vehicleContract)] ?? "") : ""}
          />
          <ReviewRow
            icon={<Key className="w-4 h-4" />}
            label={t("courier.add.licenseNumber")}
            value={step2.licenseNumber}
          />
          <ReviewRow
            icon={<Calendar className="w-4 h-4" />}
            label={t("courier.add.licenseExpiry")}
            value={step2.licenseExpiry}
          />
          <ReviewRow
            icon={<Hash className="w-4 h-4" />}
            label={t("courier.add.operationsCardNumber")}
            value={step2.vehicle.operationCardNumber}
          />
        </ReviewCard>
      </div>

      {/* Completion progress bar */}
      <div className="p-5 bg-green-50 rounded-2xl border border-green-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-bold font-['Cairo'] text-green-700">
            {completion}%
          </span>
          <span className="text-sm font-bold font-['Cairo'] text-green-700">
            {t("courier.add.review.dataCompletion")}
          </span>
        </div>
        <div className="w-full h-2.5 bg-green-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;
