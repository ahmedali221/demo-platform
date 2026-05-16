import React, { useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import { useUserStore } from '../../store/auth.store';
import { forgotPassword, ApiError } from '../../api/auth.service';

interface OtpModalProps {
  email: string;
  onBack: () => void;
  onSubmit: (code: string) => void;
  onResend: () => void;
}

const OTP_LENGTH = 6;

export default function OtpModal({ email, onBack, onSubmit }: OtpModalProps) {
  const { t } = useTranslation();
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const { resetPassword } = useUserStore();

  // ── Resend state ──────────────────────────────────────────────────────────
  const [resendCountdown, setResendCountdown] = useState(0);
  const [resendBlocked, setResendBlocked] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function startCountdown(seconds: number) {
    setResendCountdown(seconds);
    if (countdownRef.current) clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setResendCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => () => { if (countdownRef.current) clearInterval(countdownRef.current); }, []);

  async function handleResend() {
    if (resendBlocked || resendCountdown > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      await forgotPassword(email);
      startCountdown(120);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'Auth.OtpCooldown') {
          const match = err.message.match(/(\d+)\s*seconds?/i);
          startCountdown(match ? parseInt(match[1]) : 120);
          return;
        }
        if (err.code === 'Auth.OtpLimitExceeded') {
          setResendBlocked(true);
          setApiError(t('otp.limitExceeded'));
          return;
        }
      }
    } finally {
      setResendLoading(false);
    }
  }

  const formatCountdown = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  // ── OTP input handlers ────────────────────────────────────────────────────

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const updated = [...digits];
    updated[index] = digit;
    setDigits(updated);
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    const updated = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((char, i) => { updated[i] = char; });
    setDigits(updated);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = digits.join('');
    if (code.length < OTP_LENGTH) return;

    if (newPassword !== confirmPassword) {
      setApiError(t('resetPassword.passwordMismatch'));
      return;
    }

    setLoading(true);
    setApiError(null);

    try {
      await resetPassword(email, code, newPassword);
      onSubmit(code);
    } catch (err) {
      if (err instanceof ApiError && err.code === 'Auth.InvalidOtp') {
        setApiError(t('otp.invalidOtp'));
      } else {
        const message = err instanceof Error ? err.message : 'resetPassword.error';
        setApiError(t(message));
      }
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = ({ open }: { open: boolean }) => open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-md mx-4 p-8" dir="ltr">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-6 text-sm font-medium"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          {t('otp.back')}
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {t('otp.title')}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-8 leading-relaxed">
          {t('otp.description', { email })}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* OTP inputs */}
          <div className="flex justify-between gap-1" dir="ltr" onPaste={handlePaste}>
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="otp-input"
              />
            ))}
          </div>

          {/* Resend */}
          <div className="flex justify-start">
            {resendBlocked ? (
              <span className="text-xs text-red-500 font-medium">{t('otp.limitExceeded')}</span>
            ) : resendCountdown > 0 ? (
              <span className="text-sm text-gray-400 font-medium">
                {t('otp.resendIn', { time: formatCountdown(resendCountdown) })}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#C9A44C] transition-colors font-medium disabled:opacity-50"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6" />
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
                {resendLoading ? t('otp.resendLoading') : t('otp.resend')}
              </button>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('resetPassword.newPasswordLabel')}
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('resetPassword.newPasswordPlaceholder')}
                required
                className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:border-[#C9A44C] transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                <EyeIcon open={showNewPassword} />
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('resetPassword.confirmPasswordLabel')}
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('resetPassword.confirmPasswordPlaceholder')}
                required
                className="w-full px-4 py-3 pr-10 border border-gray-200 rounded-xl placeholder:text-gray-400 focus:outline-none focus:border-[#C9A44C] transition-colors text-sm"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                <EyeIcon open={showConfirmPassword} />
              </button>
            </div>
          </div>

          {apiError && (
            <p className="text-red-500 text-sm">{apiError}</p>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
            disabled={digits.join('').length < OTP_LENGTH}
          >
            {t('otp.submitButton')}
          </Button>
        </form>
      </div>
    </div>
  );
}
