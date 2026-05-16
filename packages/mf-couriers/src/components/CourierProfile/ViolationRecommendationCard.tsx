import React, { useState } from "react";
import i18n from "../../lib/i18n";
import { useTranslation } from "react-i18next";

type ModalType = "apply" | "warning" | "suspend" | "ignore" | null;

type ActionButtonProps = {
  label: string;
  variant: "success" | "warning" | "danger" | "muted";
  icon: React.ReactNode;
  onClick: () => void;
};

const CheckIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none">
    <path
      d="M16.5 5.5L8 14L3.8 9.8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WarningIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none">
    <path d="M10 2.5L18 16.5H2L10 2.5Z" fill="currentColor" />
    <path d="M10 7V11" stroke="white" strokeWidth="1.7" strokeLinecap="round" />
    <path
      d="M10 14H10.01"
      stroke="white"
      strokeWidth="2.3"
      strokeLinecap="round"
    />
  </svg>
);

const StopIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.7" />
    <path
      d="M5.5 14.5L14.5 5.5"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const BackIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none">
    <path
      d="M7 7H3V3"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.5 7.5C5 4.8 8.2 3.5 11.2 4.3C14.7 5.2 16.8 8.7 15.9 12.2C15 15.7 11.5 17.8 8 16.9"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
    />
  </svg>
);

const ActionButton = ({ label, variant, icon, onClick }: ActionButtonProps) => {
  const classes = {
    success:
      "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600",
    warning:
      "bg-orange-500/10 text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white",
    danger:
      "bg-red-500/10 text-red-500 border-red-500 hover:bg-red-500 hover:text-white",
    muted: "bg-slate-800 text-blue-700 border-slate-800 hover:bg-slate-700",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-[46px] max-w-50 items-center justify-center cursor-pointer gap-2 rounded-lg border px-5 text-base font-bold transition ${classes[variant]}`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

const ModalShell = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      dir="rtl"
    >
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-white/50 backdrop-blur-[3px]"
      />

      <div className="relative z-10 w-full max-w-[430px] rounded-xl bg-white p-6 shadow-2xl">
        {children}
      </div>
    </div>
  );
};

const ActionModal = ({
  type,
  onClose,
}: {
  type: Exclude<ModalType, null>;
  onClose: () => void;
}) => {
  const { t } = useTranslation();

  if (type === "apply") {
    return (
      <ModalShell onClose={onClose}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500 text-white">
            <CheckIcon />
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            {t("courier.modal.apply.title")}
          </h3>

          <p className="mt-2 text-sm font-medium text-slate-700">
            {t("courier.modal.apply.reason")}
          </p>

          <div className="mt-5 w-full rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm font-bold text-red-500">
            {t("courier.modal.apply.fine")}
          </div>

          <div className="mt-5 grid w-full grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-md border border-blue-900 text-sm font-bold text-blue-900 transition hover:bg-blue-50"
            >
              {t("courier.modal.cancel")}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-md bg-emerald-500 text-sm font-bold text-white transition hover:bg-emerald-600"
            >
              {t("courier.modal.apply.confirm")}
            </button>
          </div>
        </div>
      </ModalShell>
    );
  }

  if (type === "warning") {
    return (
      <ModalShell onClose={onClose}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 text-yellow-500">
            <WarningIcon className="h-10 w-10" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            {t("courier.modal.warning.title")}
          </h3>

          <p className="mt-2 text-sm font-medium text-slate-700">
            {t("courier.modal.warning.forCourier")} محمد العطار
          </p>

          <textarea
            rows={4}
            placeholder={t("courier.modal.warning.placeholder")}
            className="mt-5 w-full resize-none rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:bg-white"
          />

          <div className="mt-5 grid w-full grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-md border border-blue-900 text-sm font-bold text-blue-900 transition hover:bg-blue-50"
            >
              {t("courier.modal.cancel")}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-md bg-orange-500 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              {t("courier.modal.warning.confirm")}
            </button>
          </div>
        </div>
      </ModalShell>
    );
  }

  if (type === "suspend") {
    return (
      <ModalShell onClose={onClose}>
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 text-red-500">
            <StopIcon className="h-10 w-10" />
          </div>

          <h3 className="text-lg font-bold text-slate-900">
            {t("courier.modal.suspend.title")}
          </h3>

          <p className="mt-2 text-sm font-medium text-slate-700">
            {t("courier.modal.suspend.forCourier")} محمد العطار
          </p>

          <p className="mt-1 text-sm font-bold text-red-500">
            {t("courier.modal.suspend.duration")}
          </p>

          <div className="mt-5 grid w-full grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-md border border-blue-900 text-sm font-bold text-blue-900 transition hover:bg-blue-50"
            >
              {t("courier.modal.cancel")}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-md bg-red-600 text-sm font-bold text-white transition hover:bg-red-700"
            >
              {t("courier.modal.suspend.confirm")}
            </button>
          </div>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-blue-100 text-blue-700">
          <BackIcon />
        </div>

        <h3 className="text-lg font-bold text-slate-900">
          {t("courier.modal.ignore.title")}
        </h3>

        <p className="mt-2 text-sm font-medium text-slate-600">
          {t("courier.modal.ignore.description")}
        </p>

        <div className="mt-5 grid w-full grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-md border border-blue-900 text-sm font-bold text-blue-900 transition hover:bg-blue-50"
          >
            {t("courier.modal.cancel")}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-md bg-blue-700 text-sm font-bold text-white transition hover:bg-blue-800"
          >
            {t("courier.modal.ignore.confirm")}
          </button>
        </div>
      </div>
    </ModalShell>
  );
};

const ViolationRecommendationCard = () => {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [openAction, setOpenAction] = useState(false);
  const lang = i18n.language;
  const { t } = useTranslation();

  return (
    <div dir={lang == "ar" ? "rtl" : "ltr"} className="mt-6">
      <div className="mx-auto space-y-5">
        <section className="rounded-2xl bg-[#eeeeee] px-6 py-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <p className="text-lg font-medium text-[#686868]">
              {t("courier.recommendation.dismissed")}
            </p>

            <button
              type="button"
              onClick={() => setOpenAction(!openAction)}
              className="rounded-lg bg-slate-300 px-7 py-4 text-base font-bold text-blue-900 transition hover:bg-slate-400"
            >
              {t("courier.recommendation.reactivate")}
            </button>
          </div>
        </section>

        <section
          className="rounded-xl border border-[#C0392B] bg-[#C0392B0D] p-6 overflow-hidden"
          style={{
            transition: "all 0.3s ease",
            height: openAction ? "fit-content" : "0px",
            padding: openAction ? "24px" : "0px",
          }}
        >
          <div className="flex justify-between  overflow-hidden rounded-lg">
            <div className="text-right">
              <div className="mb-4 flex items-center justify-start gap-2 text-red-500">
                <span className="h-3 w-3 rounded-full bg-red-500" />
                <WarningIcon className="h-6 w-6" />
                <h2 className="text-3xl font-extrabold">{t("courier.highDanger")}</h2>
              </div>

              <p className="text-lg font-bold text-slate-300">
                السبب: 4 مخالفات إلغاء خلال 7 أيام (الحد:4)
              </p>

              <p className="mt-4 text-lg font-bold text-slate-300">
                {t("courier.recommendation.suggestedAction")}
                <span className="mr-2 text-2xl font-extrabold text-red-500">
                  إيقاف 1 يوم
                </span>
              </p>

              <p className="mt-5 text-base font-medium text-slate-500 underline">
                آخر إجراء: إيقاف 4 — 11 أبريل 2026 بواسطة محمد العمري
              </p>
            </div>
            <div className="flex flex-col gap-4 max-w-50">
              <ActionButton
                label={t("courier.recommendation.applyAction")}
                variant="success"
                icon={<CheckIcon />}
                onClick={() => setModalType("apply")}
              />

              <div className="grid grid-cols-2 gap-3">
                <ActionButton
                  label={t("courier.recommendation.warn")}
                  variant="warning"
                  icon={<WarningIcon />}
                  onClick={() => setModalType("warning")}
                />

                <ActionButton
                  label={t("courier.recommendation.suspend")}
                  variant="danger"
                  icon={<StopIcon />}
                  onClick={() => setModalType("suspend")}
                />
              </div>

              <button
                type="button"
                onClick={() => setModalType("ignore")}
                className="flex max-w-full items-center cursor-pointer rounded-md justify-center gap-2 py-3.5 bg-[#1D347840] px-4 text-sm font-bold border border-[#FFFFFF0D] text-[#1D3478] transition hover:bg-[#2d3048]"
              >
                <BackIcon className="h-4 w-4" />
                <span>{t("courier.recommendation.ignore")}</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {modalType && (
        <ActionModal type={modalType} onClose={() => setModalType(null)} />
      )}
    </div>
  );
};

export default ViolationRecommendationCard;
