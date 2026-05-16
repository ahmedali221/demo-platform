import React, { useEffect, useState } from "react";
import "../index.css";
import "../lib/i18n";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Step1PersonalInfo, {
  Step1Form,
  defaultStep1Form,
} from "../components/AddCourier/Step1PersonalInfo";
import Step2OperationsInfo, {
  Step2Form,
  defaultStep2Form,
} from "../components/AddCourier/Step2WorkVehicle";
import Step3Review from "../components/AddCourier/ReviewStep";
import SuccessModal from "../components/AddCourier/SuccessModal";
import back from "../assets/back-arrow.svg";
import "../lib/i18n";

import add from "../assets/add.svg";
import done from "../assets/done.svg";
import { createCourier, getCourierLookups } from "../api/courier.service";
import { CouriersLookupsResponse } from "../types/Couriers";

const STEPS = [
  { labelAr: "المعلومات الشخصية", labelEn: "Personal Info" },
  { labelAr: "بيانات العمل", labelEn: "Work Info" },
  { labelAr: "المراجعة والإرسال", labelEn: "Review & Submit" },
];

type FieldErrors = Record<string, string>;

const AddCourierPage = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [step1, setStep1] = useState<Step1Form>(defaultStep1Form);
  const [step2, setStep2] = useState<Step2Form>(defaultStep2Form);
  const [lookups, setLookups] = useState<CouriersLookupsResponse>();
  const [step1Errors, setStep1Errors] = useState<FieldErrors>({});
  const [step2Errors, setStep2Errors] = useState<FieldErrors>({});
  const [successData, setSuccessData] = useState<{
    name: string;
    id: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isAr = i18n.language?.startsWith("ar");

  const required = t("courier.add.requiredField");
  const getLookups = async () => {
    const data = await getCourierLookups();
    setLookups(data);
  };
  useEffect(() => {
    getLookups();
  }, []);
  const validateStep1 = (): boolean => {
    const errors: FieldErrors = {};
    if (!step1.fullName.trim()) errors.fullName = required;
    if (!step1.externalName.trim()) errors.externalName = required;
    if (!step1.externalId.trim()) errors.externalId = required;
    if (!step1.address.trim()) errors.address = required;
    if (!step1.cityId.trim()) errors.cityId = required;
    if (!step1.email.trim()) {
      errors.email = required;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(step1.email)) {
      errors.email = t("courier.add.invalidEmail");
    }
    if (!step1.appPhone.trim()) errors.appPhone = required;
    if (!step1.absherPhone.trim()) errors.absherPhone = required;
    if (!step1.idType) errors.idType = required;
    if (!step1.idNumber.trim()) errors.idNumber = required;
    if (!step1.idExpiryDate) errors.idExpiryDate = required;
    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const errors: FieldErrors = {};
    if (!step2.provider) errors.provider = required;
    if (!step2.vehicle.vehicleType) errors["vehicle.vehicleType"] = required;
    if (!step2.workStartDate) errors.workStartDate = required;
    if (!step2.licenseNumber.trim()) errors.licenseNumber = required;
    if (!step2.licenseExpiry) errors.licenseExpiry = required;
    setStep2Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildPayload = () => {
    const nameParts = step1.fullName.trim().split(/\s+/);
    const firstName = nameParts[0] ?? "";
    const lastName = nameParts.slice(1).join(" ") || firstName;

    const payload: any = { firstName, lastName };

    if (step1.email) payload.email = step1.email;
    if (step1.appPhone) payload.appPhone = step1.appPhone;
    if (step1.absherPhone) payload.absherPhone = step1.absherPhone;
    if (step1.idType) payload.idType = Number(step1.idType);
    if (step1.idNumber) payload.idNumber = step1.idNumber;
    if (step1.idExpiryDate) payload.idExpiryDate = step1.idExpiryDate;
    if (step1.cityId) payload.cityId = step1.cityId;
    if (step1.address) payload.address = step1.address;

    if (step1.externalId) payload.externalId = step1.externalId;
    if (step1.externalName) payload.externalName = step1.externalName;
    if (step2.provider) payload.providerId = String(step2.provider);

    if (step2.supervisorId) payload.supervisorId = step2.supervisorId;
    if (step2.workStartDate) payload.workStartDate = step2.workStartDate;
    if (step2.licenseType) payload.licenseType = Number(step2.licenseType);
    if (step2.licenseNumber) payload.licenseNumber = step2.licenseNumber;
    if (step2.licenseExpiry) payload.licenseExpiryDate = step2.licenseExpiry;

    const v = step2.vehicle;
    if (v.vehicleType) payload.vehicleType = Number(v.vehicleType);
    if (v.vehicleContract) payload.contractType = Number(v.vehicleContract);
    if (v.operationCardNumber) payload.operationCardNumber = v.operationCardNumber;
    if (v.operationCardExpiry) payload.operationCardExpiry = v.operationCardExpiry;
    if (v.plateNumber) payload.plateNumber = v.plateNumber;
    if (v.vehicleSerialNumber) payload.vehicleSerialNumber = v.vehicleSerialNumber;

    return payload;
  };

  const handleNext = () => {
    if (activeStep === 0 && !validateStep1()) return;
    if (activeStep === 1 && !validateStep2()) return;
    setActiveStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const submitForm = async () => {
    const s1Valid = validateStep1();
    const s2Valid = validateStep2();
    if (!s1Valid || !s2Valid) {
      setActiveStep(s1Valid ? 1 : 0);
      return;
    }
    setSubmitting(true);
    try {
      const data = await createCourier(buildPayload());
      setSuccessData({
        name: step1.fullName,
        id: data?.id ?? data?.externalId ?? data?.code ?? "",
      });
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const clearStep1Error = (field: string) =>
    setStep1Errors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

  const clearStep2Error = (field: string) =>
    setStep2Errors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });

  return (
    <>
      {successData && (
        <SuccessModal
          courierName={successData.name}
          courierId={successData.id}
          onBackToList={() => navigate("/couriers")}
          onViewProfile={() =>
            navigate(
              successData.id ? `/couriers/${successData.id}` : "/couriers",
            )
          }
        />
      )}

      <div
        className="px-5 py-5 xl:py-6 xl:px-12 flex-1 flex flex-col h-full min-h-0"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex gap-5 items-end">
          <div
            className="flex gap-2 text-xl font-bold text-[#201B13] cursor-pointer"
            onClick={() => navigate("/couriers")}
          >
            <img src={back} />
            <span>{t("courier.back")}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-sm text-[#A2A2A2]">
              {t("courier.couriers")}
            </span>
            <span className="text-[#64748B] text-sm">/</span>
            <span className="text-[#64748B] text-sm text-bold">
              {t("courier.addNewCourier")}
            </span>
          </div>
        </div>

        <div className="flex gap-4 mt-6 items-center">
          <img src={add} className="h-7" />
          <div className="flex flex-col gap-3">
            <p className="text-xl font-bold">{t("courier.addNewCourier")}</p>
            <p className="text-xs">{t("courier.addNewCourier")}</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center justify-between mt-10 mb-6">
          {STEPS.map((step, index) => (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold font-['Cairo'] transition-colors ${
                    index < activeStep
                      ? "bg-white text-[#1D3478] border border-[#36C220]"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {index < activeStep ? <img src={done} /> : index + 1}
                </div>
                <span
                  className={`text-xs font-semibold font-['Cairo'] whitespace-nowrap ${
                    index <= activeStep ? "text-blue-900" : "text-gray-400"
                  }`}
                >
                  {isAr ? step.labelAr : step.labelEn}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mb-6 mx-3 transition-colors ${
                    index < activeStep ? "bg-[#36C220]" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 pr-1">
          {activeStep === 0 && (
            <Step1PersonalInfo
              lookups={lookups}
              data={step1}
              onChange={setStep1}
              errors={step1Errors}
              onClearError={clearStep1Error}
            />
          )}
          {activeStep === 1 && (
            <Step2OperationsInfo
              lookups={lookups}
              data={step2}
              onChange={setStep2}
              errors={step2Errors}
              onClearError={clearStep2Error}
            />
          )}
          {activeStep === 2 && (
            <Step3Review lookups={lookups!} step1={step1} step2={step2} />
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
            disabled={activeStep === 0}
            className="px-18 py-2.5 border border-[#1D3478] bg-[#2433470D] text-gray-600 text-sm font-semibold font-['Cairo'] rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {t("courier.add.previous")}
          </button>
          <button
            type="button"
            onClick={activeStep === STEPS.length - 1 ? submitForm : handleNext}
            disabled={submitting}
            className="px-18 py-2.5 bg-[#D2A947] text-white text-sm font-bold font-['Cairo'] rounded-xl hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {activeStep === STEPS.length - 1
              ? t("courier.add.confirm")
              : t("courier.add.next")}
          </button>
        </div>
      </div>
    </>
  );
};

export default AddCourierPage;
