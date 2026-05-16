import React, { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown, UploadCloud, MapPin, User } from "lucide-react";
import { CouriersLookupsResponse } from "../../types/Couriers";

const ID_TYPE_OPTIONS = [
  { id: 1, name: "هوية وطنية" },
  { id: 2, name: "إقامة" },
  { id: 3, name: "جواز سفر" },
];

export interface Step1Form {
  fullName: string;
  externalName: string;
  externalId: string;
  email: string;
  appPhone: string;
  absherPhone: string;
  idType: number | null;
  idNumber: string;
  idExpiryDate: string;
  cityId: string;
  address: string;
  idImage: File | null;
}

export const defaultStep1Form: Step1Form = {
  fullName: "",
  externalName: "",
  externalId: "",
  email: "",
  appPhone: "",
  absherPhone: "",
  idType: null,
  idNumber: "",
  idExpiryDate: "",
  cityId: "",
  address: "",
  idImage: null,
};

const PhoneField = ({
  value,
  onChange,
  hasError,
}: {
  value: string;
  onChange: (v: string) => void;
  hasError?: boolean;
}) => (
  <div
    className={`h-11 px-3 bg-gray-100 rounded-xl flex items-center gap-1.5 overflow-hidden ${hasError ? "border border-red-400" : ""}`}
  >
    <input
      type="tel"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="05XXXXXXXX"
      className="flex-1 bg-transparent text-right text-xs font-normal font-['Inter'] text-gray-700 placeholder:text-neutral-400 outline-none min-w-0"
    />
    <span className="text-neutral-400 text-xs font-semibold font-['Inter'] shrink-0">
      +966
    </span>
  </div>
);

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? (
    <span className="text-xs text-red-500 font-['Cairo']">{msg}</span>
  ) : null;

const Step1PersonalInfo = ({
  lookups,
  data,
  onChange,
  errors = {},
  onClearError,
}: {
  lookups: CouriersLookupsResponse | undefined;
  data: Step1Form;
  onChange: (d: Step1Form) => void;
  errors?: Record<string, string>;
  onClearError?: (field: string) => void;
}) => {
  const idExpiryRef = useRef<HTMLInputElement | null>(null);
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const ID_TYPES = ID_TYPE_OPTIONS;
  const cityIds = (lookups?.cities ?? []).map((c) => ({ id: c.id, name: c.nameAr || c.name }));
  const update = (field: keyof Step1Form, value: string | File | null) => {
    onChange({ ...data, [field]: value });
    onClearError?.(field as string);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) update("idImage", file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) update("idImage", file);
  };

  const selectedIdType = ID_TYPES.find((o) => o.id == data.idType);
  const selectedCity = cityIds.find((o) => o.id == data.cityId);
  return (
    <div className="flex gap-4 items-start">
      {/* Right side: forms */}
      <div className="flex-2 flex flex-col gap-4 min-w-0">
        {/* Personal Information Card */}
        <div className="p-6 bg-white rounded-2xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-['Cairo'] text-zinc-900">
              {t("courier.add.personalInfo")}
            </span>
            <User className="w-5 h-5 text-zinc-900" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Right column (first in RTL) */}
            <div className="flex flex-col gap-6">
              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold font-['Cairo'] text-black">
                  {t("courier.add.fullName")}
                </label>
                <div
                  className={`h-11 px-3 bg-gray-100 rounded-xl flex items-center overflow-hidden ${errors.fullName ? "border border-red-400" : ""}`}
                >
                  <input
                    type="text"
                    value={data.fullName}
                    onChange={(e) => update("fullName", e.target.value)}
                    placeholder={t("courier.add.fullNamePlaceholder")}
                    className="w-full bg-transparent text-right text-xs font-normal font-['Cairo'] text-gray-700 placeholder:text-neutral-400 outline-none"
                  />
                </div>
                <FieldError msg={errors.fullName} />
              </div>
              {/* external Id */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold font-['Cairo'] text-black">
                  {t("courier.add.externalId")}
                </label>
                <div
                  className={`h-11 px-3 bg-gray-100 rounded-xl flex items-center overflow-hidden ${errors.externalId ? "border border-red-400" : ""}`}
                >
                  <input
                    type="text"
                    value={data.externalId}
                    onChange={(e) => update("externalId", e.target.value)}
                    placeholder={t("courier.add.externalIdPlaceholder")}
                    className="w-full bg-transparent text-right text-xs font-normal font-['Cairo'] text-gray-700 placeholder:text-neutral-400 outline-none"
                  />
                </div>
                <FieldError msg={errors.externalId} />
              </div>

              {/* Phone */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold font-['Cairo'] text-black">
                  {t("courier.add.phone")}
                </label>
                <PhoneField
                  value={data.appPhone}
                  onChange={(v) => update("appPhone", v)}
                  hasError={!!errors.appPhone}
                />
                <FieldError msg={errors.appPhone} />
              </div>

              {/* ID Number */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold font-['Cairo'] text-black">
                  {t("courier.add.idNumber")}
                </label>
                <div
                  className={`h-11 px-3 bg-gray-100 rounded-xl flex items-center overflow-hidden ${errors.idNumber ? "border border-red-400" : ""}`}
                >
                  <input
                    type="text"
                    value={data.idNumber}
                    onChange={(e) => update("idNumber", e.target.value)}
                    placeholder="1XXXXXXXXX"
                    className="w-full bg-transparent text-right text-xs font-normal font-['Inter'] text-gray-700 placeholder:text-neutral-400 outline-none"
                  />
                </div>
                <FieldError msg={errors.idNumber} />
              </div>

              {/* Absher Phone */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold font-['Cairo'] text-black">
                  {t("courier.add.absherPhone")}
                </label>
                <PhoneField
                  value={data.absherPhone}
                  onChange={(v) => update("absherPhone", v)}
                  hasError={!!errors.absherPhone}
                />
                <FieldError msg={errors.absherPhone} />
              </div>
            </div>

            {/* Left column (second in RTL) */}
            <div className="flex flex-col gap-6">
              {/* external Id */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold font-['Cairo'] text-black">
                  {t("courier.add.externalName")}
                </label>
                <div
                  className={`h-11 px-3 bg-gray-100 rounded-xl flex items-center overflow-hidden ${errors.externalName ? "border border-red-400" : ""}`}
                >
                  <input
                    type="text"
                    value={data.externalName}
                    onChange={(e) => update("externalName", e.target.value)}
                    placeholder={t("courier.add.externalIdPlaceholder")}
                    className="w-full bg-transparent text-right text-xs font-normal font-['Cairo'] text-gray-700 placeholder:text-neutral-400 outline-none"
                  />
                </div>
                <FieldError msg={errors.externalName} />
              </div>
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold font-['Cairo'] text-black">
                  {t("courier.add.email")}
                </label>
                <div
                  className={`h-11 px-3 bg-gray-100 rounded-xl flex items-center overflow-hidden ${errors.email ? "border border-red-400" : ""}`}
                >
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="example@domain.com"
                    className="w-full bg-transparent text-right text-xs font-normal font-['Inter'] text-gray-700 placeholder:text-neutral-400 outline-none"
                  />
                </div>
                <FieldError msg={errors.email} />
              </div>

              {/* ID Type */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold font-['Cairo'] text-black">
                  {t("courier.add.idType")}
                </label>
                <div
                  className={`h-11 px-3 bg-gray-100 rounded-xl flex items-center justify-between overflow-hidden relative ${errors.idType ? "border border-red-400" : ""}`}
                >
                  <select
                    value={data.idType ? data.idType : ""}
                    onChange={(e) => update("idType", e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  >
                    <option value="" selected disabled>
                      {t("courier.add.choose")}
                    </option>
                    {ID_TYPES?.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name}
                      </option>
                    ))}
                  </select>
                  <span
                    className={`text-xs font-normal font-['Cairo'] leading-6 ${selectedIdType ? "text-gray-700" : "text-neutral-400"}`}
                  >
                    {selectedIdType
                      ? selectedIdType.name
                      : t("courier.add.choose")}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
                </div>
                <FieldError msg={errors.idType} />
              </div>

              {/* ID Expiry */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold font-['Cairo'] text-black">
                  {t("courier.add.idExpiry")}
                </label>
                <div
                  onClick={() => {
                    const input = idExpiryRef.current;
                    if (!input) return;
                    if (input.showPicker) {
                      input.showPicker();
                    } else {
                      input.focus();
                      input.click();
                    }
                  }}
                  className={`h-11 px-3 bg-gray-100 rounded-xl flex items-center  overflow-hidden relative cursor-pointer ${errors.idExpiryDate ? "border border-red-400" : ""}`}
                >
                  <input
                    ref={idExpiryRef}
                    type="date"
                    value={data.idExpiryDate}
                    onChange={(e) => update("idExpiryDate", e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {data.idExpiryDate ? (
                    <span className="text-xs text-gray-700 font-['Inter'] pointer-events-none">
                      {data.idExpiryDate}
                    </span>
                  ) : (
                    <span className="text-neutral-400 text-xs font-normal font-['Inter'] leading-6 select-none pointer-events-none">
                      mm/dd/yyyy
                    </span>
                  )}
                </div>
                <FieldError msg={errors.idExpiryDate} />
              </div>
            </div>
          </div>
        </div>

        {/* Location Data Card */}
        <div className="p-6 bg-white rounded-2xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex flex-col gap-6">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-['Cairo'] text-zinc-900">
              {t("courier.add.locationData")}
            </span>
            <MapPin className="w-5 h-5 text-zinc-900" />
          </div>

          <div className="flex flex-col gap-6">
            {/* City */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold font-['Cairo'] text-black">
                {t("courier.add.city")}
              </label>
              <div
                className={`h-11 px-3 bg-gray-100 rounded-xl flex items-center justify-between overflow-hidden relative ${errors.cityId ? "border border-red-400" : ""}`}
              >
                <select
                  value={data.cityId ? data.cityId : ""}
                  onChange={(e) => update("cityId", e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                >
                  <option value="" selected disabled>
                    {t("courier.add.choose")}
                  </option>
                  {cityIds?.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.name}
                    </option>
                  ))}
                </select>
                <span
                  className={`text-xs font-normal font-['Cairo'] leading-6 ${selectedCity ? "text-gray-700" : "text-neutral-400"}`}
                >
                  {selectedCity ? selectedCity.name : t("courier.add.choose")}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
              </div>
              <FieldError msg={errors.cityId} />
            </div>

            {/* Address */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold font-['Cairo'] text-black">
                {t("courier.add.address")}
              </label>
              <div
                className={`h-11 px-3 bg-gray-100 rounded-xl flex items-center overflow-hidden ${errors.address ? "border border-red-400" : ""}`}
              >
                <input
                  type="text"
                  value={data.address}
                  onChange={(e) => update("address", e.target.value)}
                  placeholder={t("courier.add.addressPlaceholder")}
                  className="w-full bg-transparent text-right text-xs font-normal font-['Cairo'] text-gray-700 placeholder:text-neutral-400 outline-none"
                />
              </div>
              <FieldError msg={errors.address} />
            </div>
          </div>
        </div>
      </div>

      {/* Left side: Identity image upload */}
      <div className="flex-1 h-vh shrink-0 p-6 bg-white rounded-2xl shadow-[0px_0px_0px_3px_rgba(252,190,4,0.25)] flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-xl font-bold font-['Cairo'] text-black text-right w-full">
            {t("courier.add.idImage")}
          </span>
          <p className="text-xs font-normal font-['Cairo'] text-slate-400 leading-relaxed text-right">
            {t("courier.add.idImageDesc")}
          </p>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`h-64 p-6 rounded-xl border border-neutral-400 flex flex-col items-center justify-center gap-6 cursor-pointer transition-colors ${
            isDragging ? "bg-blue-50 border-blue-400" : "hover:bg-gray-50"
          }`}
        >
          {data.idImage ? (
            <>
              <UploadCloud className="w-10 h-10 text-green-500" />
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-medium font-['Cairo'] text-center text-gray-700 break-all">
                  {data.idImage.name}
                </span>
                <span className="text-xs font-normal font-['Cairo'] text-neutral-400">
                  {t("courier.add.clickToChange")}
                </span>
              </div>
            </>
          ) : (
            <>
              <UploadCloud className="w-10 h-10 text-gray-400" />
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs font-medium font-['Cairo'] text-center text-black">
                  {t("courier.add.dragOrUpload")}
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
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default Step1PersonalInfo;
