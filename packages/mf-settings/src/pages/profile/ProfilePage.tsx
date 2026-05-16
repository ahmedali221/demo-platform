import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import "../../lib/i18n";
import PersonalInfoSection from "./components/PersonalInfoSection";
import LanguageTimezoneSection from "./components/LanguageTimezoneSection";
import "../../index.css";
import {
  getProfile,
  updateProfile,
  uploadFile,
} from "./profile.service";
import Breadcrumb from "../../shared/Breadcrumb";

const UserAvatarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-gray-400">
    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-5.67 0-8 2.67-8 4v1h16v-1c0-1.33-2.33-4-8-4z" />
  </svg>
);

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  bio: string;
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
}

const EMPTY_FORM: ProfileForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  jobTitle: "",
  department: "",
  bio: "",
  language: "ar",
  timezone: "Asia/Riyadh",
  dateFormat: "DD/MM/YYYY",
  timeFormat: "12h",
};

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [photoBlobName, setPhotoBlobName] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // ── helpers ──────────────────────────────────────────────────────────────

  const applyProfile = async (data: Awaited<ReturnType<typeof getProfile>>["data"]) => {
    setForm({
      firstName: data.firstName ?? "",
      lastName: data.lastName ?? "",
      email: data.email ?? "",
      phone: data.phoneNumber ?? "",
      jobTitle: data.jobTitle ?? "",
      department: data.department ?? "",
      bio: data.bio ?? "",
      language: data.language ?? "ar",
      timezone: data.timezone ?? "Asia/Riyadh",
      dateFormat: data.dateFormat ?? "DD/MM/YYYY",
      timeFormat: data.timeFormat ?? "12h",
    });

    if (data.profilePhotoUrl) {
      setAvatarPreview(data.profilePhotoUrl);
    } else {
      setAvatarPreview(null);
    }
    setPhotoBlobName(null);
  };

  // ── load profile on mount ─────────────────────────────────────────────────

  useEffect(() => {
    setLoading(true);
    setApiError(null);
    getProfile()
      .then(({ data }) => applyProfile(data))
      .catch(() => setApiError(t("settings.loadError", { defaultValue: "Failed to load profile." })))
      .finally(() => setLoading(false));
  }, []);

  // ── handlers ──────────────────────────────────────────────────────────────

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setApiError(null);
    try {
      const { data } = await uploadFile(file);
      setAvatarPreview(data.signedUrl);
      setPhotoBlobName(data.blobName);
    } catch {
      setApiError(t("settings.uploadError", { defaultValue: "Failed to upload photo." }));
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDeleteAvatar = () => {
    setAvatarPreview(null);
    setPhotoBlobName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    // Client-side validation for required fields
    if (!form.firstName.trim()) {
      setApiError(t("settings.validation.firstNameRequired", { defaultValue: "الاسم الأول مطلوب." }));
      return;
    }
    if (!form.lastName.trim()) {
      setApiError(t("settings.validation.lastNameRequired", { defaultValue: "اسم العائلة مطلوب." }));
      return;
    }

    setSaving(true);
    setSaveSuccess(false);
    setApiError(null);
    try {
      await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        phoneNumber: form.phone || null,
        jobTitle: form.jobTitle || null,
        department: form.department || null,
        bio: form.bio || null,
        profilePhotoUrl: photoBlobName ?? avatarPreview ?? null,
        language: form.language,
        timezone: form.timezone,
        dateFormat: form.dateFormat,
        timeFormat: form.timeFormat,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      // Apply language immediately without a reload
      const lang = form.language === "en" ? "en" : "ar";
      localStorage.setItem("language", lang);
      i18n.changeLanguage(lang);
      document.documentElement.setAttribute("lang", lang);
      document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    } catch {
      setApiError(t("settings.saveError", { defaultValue: "Failed to save changes." }));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    setApiError(null);
    setSaveSuccess(false);
    setLoading(true);
    try {
      const { data } = await getProfile();
      await applyProfile(data);
    } catch {
      // silently ignore — form stays as-is
    } finally {
      setLoading(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <div className="p-6 mx-auto">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-6">
        <Breadcrumb pageTitleKey="settings.profile" />
        <div className="flex gap-2">
          <button
            onClick={handleCancel}
            disabled={saving || loading}
            className="px-4 py-2 text-sm font-semibold border border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all disabled:opacity-50"
          >
            {t("settings.cancel")}
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-5 py-2 text-sm font-semibold bg-[#2E75B6] text-white rounded-xl hover:bg-[#245E91] shadow-sm hover:shadow-md transition-all disabled:opacity-60 flex items-center gap-2"
          >
            {saving && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
            )}
            {saving ? t("settings.saving", { defaultValue: "جارٍ الحفظ…" }) : t("settings.saveChanges")}
          </button>
        </div>
      </div>

      {/* ── Inline feedback ── */}
      {apiError && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
          {apiError}
        </div>
      )}
      {saveSuccess && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 border border-green-200 text-sm text-green-700 font-medium">
          {t("settings.saveSuccess", { defaultValue: "تم الحفظ بنجاح" })}
        </div>
      )}

      {/* ── Skeleton / loading state ── */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <span className="w-8 h-8 border-4 border-[#2E75B6] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── Avatar card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-white shadow-md overflow-hidden flex items-center justify-center shrink-0">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <UserAvatarIcon />
                    )}
                  </div>
                  <span className="absolute bottom-0 end-0 w-4 h-4 rounded-full bg-green-400 border-2 border-white" />
                </div>
                <div className="text-start">
                  <p className="text-base font-semibold text-gray-800">
                    {form.firstName} {form.lastName}
                  </p>
                  <p className="text-sm text-gray-400">{t("settings.systemAdmin")}</p>
                </div>
              </div>

              {/* <div className="flex gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="px-4 py-2 text-sm font-semibold border border-[#2E75B6] text-[#2E75B6] rounded-xl hover:bg-blue-50 hover:shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {uploadingPhoto && (
                    <span className="w-3.5 h-3.5 border-2 border-[#2E75B6] border-t-transparent rounded-full animate-spin inline-block" />
                  )}
                  {t("settings.uploadPhoto")}
                </button>
                <button
                  onClick={handleDeleteAvatar}
                  className="px-4 py-2 text-sm font-semibold border border-red-200 text-red-400 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all"
                >
                  {t("settings.deletePhoto")}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div> */}
            </div>
          </div>

          {/* ── Personal info ── */}
          <PersonalInfoSection form={form} onChange={handleChange} />

          {/* ── Language & timezone ── */}
          <div className="mt-4">
            <LanguageTimezoneSection form={form} onChange={handleChange} />
          </div>
        </>
      )}
    </div>
  );
}
