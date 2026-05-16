import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import { useUserStore } from '../../store/auth.store';
import { ApiError } from '../../api/auth.service';

interface ForgotPasswordModalProps {
  onClose: () => void;
  onSubmit: (email: string) => void;
}

export default function ForgotPasswordModal({
  onClose,
  onSubmit,
}: ForgotPasswordModalProps) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { forgotPassword } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setApiError(null);

    try {
      await forgotPassword(email.trim());
      onSubmit(email.trim());
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'Auth.EmailNotFound') {
          setApiError(t('forgotPassword.emailNotFound'));
          return;
        }
        // OtpCooldown means an OTP was already sent — proceed to OTP screen
        if (err.code === 'Auth.OtpCooldown' || err.code === 'Auth.OtpLimitExceeded') {
          onSubmit(email.trim());
          return;
        }
      }
      setApiError(t('forgotPassword.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="relative bg-white rounded-2xl shadow-modal w-full max-w-xl mx-4 p-8"
        dir="rtl"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label={t('forgotPassword.close')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Title */}
        <h2 className="text-xl font-bold text-gray-900 text-center mb-3">
          {t('forgotPassword.title')}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
          {t('forgotPassword.description')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
              {t('forgotPassword.emailLabel')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('forgotPassword.emailPlaceholder')}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-right placeholder:text-gray-400 focus:outline-none focus:border-[#C9A44C] transition-colors text-sm"
            />
          </div>

          {apiError && (
            <p className="text-red-500 text-sm text-right">{apiError}</p>
          )}

          <Button type="submit" variant="primary" fullWidth size="lg" loading={loading}>
            {t('forgotPassword.submitButton')}
          </Button>
        </form>
      </div>
    </div>
  );
}
