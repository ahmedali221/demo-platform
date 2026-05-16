import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  ChevronDown,
  Settings,
  FileText,
  UploadCloud,
} from "lucide-react";
import { CouriersLookupsResponse } from "../../types/Couriers";

const VEHICLE_TYPES = [
  { id: 1, name: "courier.add.vehicleTypeCar" },
  { id: 2, name: "courier.add.vehicleTypeBike" },
  { id: 3, name: "courier.add.vehicleTypeTruck" },
];

const LICENSE_TYPES = [
  { id: 1, name: "courier.add.licenseTypePrivate" },
  { id: 2, name: "courier.add.licenseTypeCommercial" },
  { id: 3, name: "courier.add.licenseTypeHeavy" },
];

const CONTRACT_TYPES = [
  { id: 1, name: "courier.add.contractTypeFinancialLease" },
  { id: 2, name: "courier.add.contractTypeOperationalLease" },
  { id: 3, name: "courier.add.contractTypeCompanyOwned" },
  { id: 4, name: "courier.add.contractTypeCourierOwned" },
];

export interface Step2Form {
  supervisorId: string;
  licenseType: number;
  provider: number;
  workStartDate: string;
  licenseNumber: string;
  vehicle: {
    vehicleType: string;
    plateNumber: string;
    vehicleSerialNumber: string;
    vehicleModel: string;
    operationCardNumber: string;
    operationCardExpiry: string;
    vehicleContract: number;
  };
  licenseExpiry: string;
  licenseImage: File | null;
}

export const defaultStep2Form: Step2Form = {
  supervisorId: "",
  licenseType: 0,
  provider: 1,
  workStartDate: "",
  vehicle: {
    vehicleType: "",
    plateNumber: "",
    vehicleSerialNumber: "",
    vehicleModel: "",
    operationCardNumber: "",
    operationCardExpiry: "",
    vehicleContract: 0,
  },
  licenseNumber: "",
  licenseExpiry: "",
  licenseImage: null,
};

const SelectField = ({
  value,
  onChange,
  options,
  placeholder = "اختر..",
  hasError,
}: {
  value: string | number;
  onChange: (v: string | number) => void;
  options: { id: string | number; name: string }[];
  placeholder?: string;
  hasError?: boolean;
}) => {
  const { t } = useTranslation();
  console.log(value);
  const selected = options.find((o) => o.id == value);

  return (
    <div
      className={`h-11 px-3 bg-gray-100 rounded-xl flex items-center justify-between overflow-hidden relative ${hasError ? "border border-red-400" : ""}`}
    >
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {t(o.name)}
          </option>
        ))}
      </select>
      <span
        className={`text-xs font-normal font-['Cairo'] leading-6 ${selected ? "text-gray-700" : "text-neutral-400"}`}
      >
        {selected ? selected.name : placeholder}
      </span>
      <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
    </div>
  );
};

const TextField = ({
  value,
  onChange,
  placeholder = "",
  hasError,
  numericOnly = false,
  maxLength,
}: {
  value: string | number;
  onChange: (v: string | number) => void;
  placeholder?: string;
  hasError?: boolean;
  numericOnly?: boolean;
  maxLength?: number;
}) => (
  <div
    className={`h-11 px-3 bg-gray-100 rounded-xl flex items-center overflow-hidden ${hasError ? "border border-red-400" : ""}`}
  >
    <input
      type="text"
      value={value}
      onChange={(e) => {
        const val = numericOnly ? e.target.value.replace(/\D/g, "") : e.target.value;
        onChange(val);
      }}
      placeholder={placeholder}
      maxLength={maxLength}
      inputMode={numericOnly ? "numeric" : undefined}
      className="w-full bg-transparent text-right text-xs font-normal font-['Cairo'] text-gray-700 placeholder:text-neutral-400 outline-none"
    />
  </div>
);

function DateField({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openCalendar = () => {
    inputRef.current?.showPicker?.();
    inputRef.current?.focus();
  };

  return (
    <div
      onClick={openCalendar}
      className={`h-11 px-3 bg-gray-100 rounded-xl flex items-center  overflow-hidden relative cursor-pointer ${hasError ? "border border-red-400" : ""}`}
    >
      <input
        ref={inputRef}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      {value ? (
        <span className="text-xs text-gray-700 font-['Inter'] pointer-events-none">
          {value}
        </span>
      ) : (
        <span className="text-neutral-400 text-xs font-normal font-['Inter'] leading-6 select-none pointer-events-none">
          mm/dd/yyyy
        </span>
      )}
    </div>
  );
}

const FieldWrapper = ({
  label,
  children,
  error,
}: {
  label: string;
  children: React.ReactNode;
  error?: string;
}) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-semibold font-['Cairo'] text-black text-right">
      {label}
    </label>
    {children}
    {error && (
      <span className="text-xs text-red-500 font-['Cairo']">{error}</span>
    )}
  </div>
);

const Step2WorkVehicle = ({
  lookups,

  data,
  onChange,
  errors = {},
  onClearError,
}: {
  lookups: CouriersLookupsResponse | undefined;
  data: Step2Form;
  onChange: (d: Step2Form) => void;
  errors?: Record<string, string>;
  onClearError?: (field: string) => void;
}) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const update = (field: string, value: string | number | File | null) => {
    const path = field.split(".");
    const updatedData = { ...data } as any;
    let cursor = updatedData;

    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      cursor[key] = { ...cursor[key] };
      cursor = cursor[key];
    }

    cursor[path[path.length - 1]] = value;
    onChange(updatedData as Step2Form);
    onClearError?.(field);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) update("licenseImage", file);
  };

  return (
    <div className="flex max-w-8xl flex-col gap-4">
      {/* Card 1: Operations Data */}
      <div className="p-6 bg-white rounded-2xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold font-['Cairo'] text-zinc-900">
            {t("courier.add.operationsData")}
          </span>
          <Settings className="w-5 h-5 text-zinc-900" />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left column */}
          <div className="flex flex-col gap-6">
            <FieldWrapper
              label={t("courier.add.platform")}
              error={errors.provider}
            >
              <SelectField
                value={data.provider}
                onChange={(v) => update("provider", v)}
                options={(lookups?.providers ?? []).map((p) => ({ id: p.id, name: p.displayNameAr || p.displayName }))}
                hasError={!!errors.provider}
              />
            </FieldWrapper>

            <FieldWrapper
              label={t("courier.add.transportMode")}
              error={errors["vehicle.vehicleType"]}
            >
              <SelectField
                value={data.vehicle.vehicleType}
                onChange={(v) => update("vehicle.vehicleType", v)}
                options={VEHICLE_TYPES}
                hasError={!!errors["vehicle.vehicleType"]}
              />
            </FieldWrapper>

            <FieldWrapper
              label={t("courier.add.workStartDate")}
              error={errors.workStartDate}
            >
              <DateField
                value={data.workStartDate}
                onChange={(v) => update("workStartDate", v)}
                hasError={!!errors.workStartDate}
              />
            </FieldWrapper>

            <FieldWrapper label={t("courier.add.operationsCardNumber")}>
              <TextField
                value={data.vehicle.operationCardNumber}
                onChange={(v) => update("vehicle.operationCardNumber", v)}
                placeholder={t("courier.add.licenseNumberPlaceholder")}
                numericOnly
              />
            </FieldWrapper>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-6">
            <FieldWrapper label={t("courier.add.supervisor")}>
              <SelectField
                value={data.supervisorId}
                options={(lookups?.supervisors ?? []).map((s) => ({ id: s.id, name: s.fullName }))}
                onChange={(v) => update("supervisorId", v)}
              />
            </FieldWrapper>

            <FieldWrapper label={t("courier.add.vehicleContract")}>
              <SelectField
                value={data.vehicle.vehicleContract}
                onChange={(v) => update("vehicle.vehicleContract", v)}
                options={CONTRACT_TYPES}
              />
            </FieldWrapper>

            <FieldWrapper label={t("courier.add.licenseType")}>
              <SelectField
                value={data.licenseType}
                onChange={(v) => update("licenseType", v)}
                options={LICENSE_TYPES}
              />
            </FieldWrapper>

            <FieldWrapper label={t("courier.add.operationsCardExpiry")}>
              <DateField
                value={data.vehicle.operationCardExpiry}
                onChange={(v) => update("vehicle.operationCardExpiry", v)}
              />
            </FieldWrapper>
          </div>
        </div>
      </div>

      {/* Card 2: License / Permits Data */}
      <div className="p-6 bg-white rounded-2xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold font-['Cairo'] text-zinc-900">
            {t("courier.add.licensePermits")}
          </span>
          <FileText className="w-5 h-5 text-zinc-900" />
        </div>

        <div className="flex gap-6 items-start">
          {/* Fields */}
          <div className="flex-2 flex flex-col gap-6">
            <FieldWrapper
              label={t("courier.add.licenseNumber")}
              error={errors.licenseNumber}
            >
              <TextField
                value={data.licenseNumber}
                onChange={(v) => update("licenseNumber", v)}
                placeholder={t("courier.add.licenseNumberPlaceholder")}
                hasError={!!errors.licenseNumber}
                numericOnly
              />
            </FieldWrapper>

            <FieldWrapper
              label={t("courier.add.licenseExpiry")}
              error={errors.licenseExpiry}
            >
              <DateField
                value={data.licenseExpiry}
                onChange={(v) => update("licenseExpiry", v)}
                hasError={!!errors.licenseExpiry}
              />
            </FieldWrapper>

            <FieldWrapper label={t("courier.add.plateNumber")}>
              <TextField
                value={data.vehicle.plateNumber}
                onChange={(v) => update("vehicle.plateNumber", v)}
                placeholder={t("courier.add.plateNumberPlaceholder")}
              />
            </FieldWrapper>

            <FieldWrapper label={t("courier.add.vehicleSerial")}>
              <TextField
                value={data.vehicle.vehicleSerialNumber}
                onChange={(v) => update("vehicle.vehicleSerialNumber", v)}
                placeholder={t("courier.add.vehicleSerialPlaceholder")}
              />
            </FieldWrapper>
          </div>

          {/* License image upload */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex-1 h-80 p-6 rounded-xl border border-neutral-400 flex flex-col items-center justify-center gap-6 cursor-pointer shrink-0 transition-colors ${
              isDragging ? "bg-blue-50 border-blue-400" : "hover:bg-gray-50"
            }`}
          >
            {data.licenseImage ? (
              <>
                <UploadCloud className="w-10 h-10 text-green-500" />
                <span className="text-xs font-medium font-['Cairo'] text-center text-gray-700 break-all">
                  {data.licenseImage.name}
                </span>
              </>
            ) : (
              <>
                <UploadCloud className="w-10 h-10 text-gray-400" />
                <div className="flex flex-col items-center gap-2">
                  <span className="text-xs font-medium font-['Cairo'] text-center text-black">
                    {t("courier.add.dragLicenseOrUpload")}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="w-40 h-11 p-2 bg-blue-900 rounded-lg flex items-center justify-center gap-2 hover:bg-blue-800 transition-colors"
                  >
                    <span className="text-sm font-bold font-['Cairo'] text-white leading-5">
                      {t("courier.add.uploadFile")}
                    </span>
                    <UploadCloud className="w-4 h-4 text-white" />
                  </button>
                </div>
              </>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) update("licenseImage", file);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Step2WorkVehicle;
