import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import ForgotPasswordModal from "../components/auth/ForgotPasswordModal";
import OtpModal from "../components/auth/OtpModal";
import { Header } from "@ops-brain/shared";
import { useTranslation } from "react-i18next";
import loginImage from "../assets/login.png";
import Logo from "../assets/logo.svg";
import { useUserStore } from "../store/auth.store";
type Modal = "none" | "forgotPassword" | "otp";

interface LoginForm {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function Login() {
  const [form, setForm] = useState<LoginForm>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [modal, setModal] = useState<Modal>("none");
  const [resetEmail, setResetEmail] = useState("");
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const navigate = useNavigate();
  const { error, login } = useUserStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const email = form.email;
    const password = form.password.trim();

    if (/\s/.test(email)) {
      setEmailError(t("login.email-spaces"));
      setLoading(false);
      return;
    }

    if (!email || !password) {
      setLoading(false);
      return;
    }

    try {
      await login({ email, password, rememberMe: form.rememberMe });
      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = (email: string) => {
    setResetEmail(email);
    setModal("otp");
  };

  const handleOtpSubmit = () => {
    setModal("none");
  };

  return (
    <div className="flex min-h-screen" dir={isRtl ? "rtl" : "ltr"}>
      {/* ── Left panel: form ── */}
      <div className="flex-1 flex flex-col">
        <Header logoSrc={Logo} />
        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 sm:px-16 py-8 sm:py-12">
          <div className="w-full max-w-lg">
            {/* Heading */}
            <div className="mb-10 text-right">
              <h1 className="text-4xl font-black text-gray-900 mb-2">
                {t("welcomeBack")}
              </h1>
              <p className="text-gray-400 text-base font-light">
                {t("login.subtitle")}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  {t("login.emailLabel")}
                </label>
                <input
                  type="text"
                  value={form.email}
                  onChange={(e) => { setEmailError(""); setForm({ ...form, email: e.target.value }); }}
                  placeholder={t("login.emailPlaceholder")}
                  required
                  className={`w-full px-4 py-3 border rounded-xl text-right placeholder:text-gray-300 focus:outline-none transition-colors text-sm bg-white ${emailError ? "border-red-500 focus:border-red-500" : "border-[#B3B3B3] focus:border-[#C9A44C]"}`}
                />
                {emailError && (
                  <p className="text-red-500 text-xs mt-1 text-right">{emailError}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                  {t("login.passwordLabel")}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder={"••••••••"}
                    required
                    className="w-full px-4 py-3 pl-12 border border-[#B3B3B3] rounded-xl text-right placeholder:text-gray-300 focus:outline-none focus:border-[#C9A44C] transition-colors text-sm bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              {error && (
                <p className="text-red-500 text-sm mt-2 text-right">
                  {t(error.toString())}
                </p>
              )}
              {/* Remember me + Forgot password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <span className="text-sm text-gray-600">
                    {t("login.rememberMe")}
                  </span>
                  <input
                    type="checkbox"
                    checked={form.rememberMe}
                    onChange={(e) =>
                      setForm({ ...form, rememberMe: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#C9A44C] cursor-pointer"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setModal("forgotPassword")}
                  className="text-sm text-gray-500 hover:text-[#C9A44C] transition-colors"
                >
                  {t("login.forgotPasswordLink")}
                </button>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="lg"
                loading={loading}
              >
                {t("login.submitButton")}
              </Button>

              {/* CAPTCHA widget */}
              {loading && (
                <div className="flex items-center justify-between bg-[#1A2332] rounded-xl px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full border-2 border-gray-500 flex items-center justify-center">
                      <svg
                        className="text-gray-400 animate-spin"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M23 4v6h-6" />
                        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white text-xs font-medium">
                        {t("login.captchaVerifying")}
                      </p>
                      <p className="text-gray-500 text-[11px]">
                        {t("login.captchaLinks")}
                      </p>
                    </div>
                  </div>
                  <div className="w-9 h-9 bg-[#C9A44C] rounded-lg flex items-center justify-center font-bold text-white text-lg">
                    C
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Footer */}
        <footer className="flex flex-col sm:flex-row items-center gap-2 sm:justify-between px-4 sm:px-8 py-4 border-t border-gray-100 text-xs text-gray-400">
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-gray-600 transition-colors">
              {t("footer.help")}
            </a>
            <a href="#" className="hover:text-gray-600 transition-colors">
              {t("footer.terms")}
            </a>
            <a href="#" className="hover:text-gray-600 transition-colors">
              {t("footer.privacy")}
            </a>
          </div>
          <p>{t("footer.copyright")}</p>
        </footer>
      </div>

      {/* ── Right panel: hero image ── */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-[#0a1628]">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/90 via-blue-800/80 to-blue-950/95" />

        {/* Grid lines decoration */}
        <img
          src={loginImage}
          alt="Login Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />
      </div>

      {/* ── Modals ── */}
      {modal === "forgotPassword" && (
        <ForgotPasswordModal
          onClose={() => setModal("none")}
          onSubmit={handleForgotSubmit}
        />
      )}
      {modal === "otp" && (
        <OtpModal
          email={resetEmail}
          onBack={() => setModal("forgotPassword")}
          onSubmit={handleOtpSubmit}
          onResend={() => console.log("Resend OTP to", resetEmail)}
        />
      )}
    </div>
  );
}
