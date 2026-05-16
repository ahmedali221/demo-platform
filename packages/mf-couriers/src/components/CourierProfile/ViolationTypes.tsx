import React, { useState } from "react";
import i18n from "../../lib/i18n";
import { useTranslation } from "react-i18next";

type ViolationItem = {
  labelKey: string;
  color?: "red" | "orange";
};

type ViolationCategory = {
  id: string;
  titleKey: string;
  items: ViolationItem[];
};

const violationCategories: ViolationCategory[] = [
  {
    id: "delay",
    titleKey: "courier.vt.delay.title",
    items: [
      { labelKey: "courier.vt.delay.cancelledDueToDelay", color: "red" },
      { labelKey: "courier.vt.delay.severeDelay", color: "red" },
      { labelKey: "courier.vt.delay.lateToStore", color: "red" },
      { labelKey: "courier.vt.delay.lateMealDelivery", color: "red" },
      { labelKey: "courier.vt.delay.minorDelay", color: "orange" },
      { labelKey: "courier.vt.delay.cancelledOrderLateCancel", color: "red" },
    ],
  },
  {
    id: "food-quality",
    titleKey: "courier.vt.foodQuality.title",
    items: [
      { labelKey: "courier.vt.foodQuality.damagedFood", color: "red" },
      { labelKey: "courier.vt.foodQuality.wrongFood", color: "red" },
      { labelKey: "courier.vt.foodQuality.missingItems", color: "orange" },
      { labelKey: "courier.vt.foodQuality.badPackaging", color: "orange" },
    ],
  },
  {
    id: "cancel-refuse",
    titleKey: "courier.vt.cancelRefuse.title",
    items: [
      { labelKey: "courier.vt.cancelRefuse.refusedPickup", color: "red" },
      { labelKey: "courier.vt.cancelRefuse.cancelledWithoutReason", color: "red" },
      { labelKey: "courier.vt.cancelRefuse.noFollowCancellationInstructions", color: "orange" },
    ],
  },
  {
    id: "partial-refund",
    titleKey: "courier.vt.partialRefund.title",
    items: [
      { labelKey: "courier.vt.partialRefund.partialRefundMissingItems", color: "red" },
      { labelKey: "courier.vt.partialRefund.partialRefundQuality", color: "red" },
      { labelKey: "courier.vt.partialRefund.partialRefundPricingError", color: "orange" },
    ],
  },
  {
    id: "location-delivery",
    titleKey: "courier.vt.locationDelivery.title",
    items: [
      { labelKey: "courier.vt.locationDelivery.wrongLocation", color: "red" },
      { labelKey: "courier.vt.locationDelivery.failedToReachCustomer", color: "red" },
      { labelKey: "courier.vt.locationDelivery.deliveredToWrongPerson", color: "red" },
      { labelKey: "courier.vt.locationDelivery.notFollowingLocationInstructions", color: "orange" },
    ],
  },
  {
    id: "behavior",
    titleKey: "courier.vt.behavior.title",
    items: [
      { labelKey: "courier.vt.behavior.unprofessionalWithCustomer", color: "red" },
      { labelKey: "courier.vt.behavior.unprofessionalWithStore", color: "red" },
      { labelKey: "courier.vt.behavior.notFollowingInstructions", color: "orange" },
      { labelKey: "courier.vt.behavior.unprofessionalDuringDelivery", color: "red" },
    ],
  },
];

const ChevronIcon = ({ open }: { open: boolean }) => {
  return (
    <svg
      className={`h-4 w-4 text-slate-600 transition-transform duration-200 ${
        open ? "rotate-180" : ""
      }`}
      viewBox="0 0 20 20"
      fill="none"
    >
      <path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const ViolationItemsList = ({ items }: { items: ViolationItem[] }) => {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-100 px-5 py-4">
      <ul className="space-y-3">
        {items.map((item, index) => (
          <li
            key={`${item.labelKey}-${index}`}
            className="flex  items-center justify-start gap-3 text-right text-sm font-medium text-slate-800"
          >
            <span
              className={`h-2 w-2 rounded-full ${
                item.color === "orange" ? "bg-orange-500" : "bg-red-500"
              }`}
            />
            <span>{t(item.labelKey)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

const CategoryAccordion = ({
  category,
  isOpen,
  onClick,
}: {
  category: ViolationCategory;
  isOpen: boolean;
  onClick: () => void;
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onClick}
        className="flex py-3.5 w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-100 px-4 text-right text-sm font-bold text-slate-900 transition hover:bg-slate-200"
      >
        <span>{t(category.titleKey)}</span>

        <ChevronIcon open={isOpen} />
      </button>

      {isOpen && <ViolationItemsList items={category.items} />}
    </div>
  );
};

const ViolationTypes = () => {
  const [mainOpen, setMainOpen] = useState<boolean>(true);
  const [openCategoryId, setOpenCategoryId] = useState<string>("");
  const lang = i18n.language;
  const { t } = useTranslation();
  const totalViolations = violationCategories.reduce(
    (total, category) => total + category.items.length,
    0,
  );

  const handleCategoryClick = (categoryId: string) => {
    setOpenCategoryId((current) => (current === categoryId ? "" : categoryId));
  };

  return (
    <div dir={lang == "ar" ? "rtl" : "ltr"}>
      <div className="mx-auto space-y-6">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <button
            type="button"
            onClick={() => setMainOpen((prev) => !prev)}
            className="flex h-[70px] w-full items-center justify-between px-6"
          >
            {" "}
            <div className="flex items-center gap-6">
              <span className="text-sm font-medium text-slate-500">
                {t("courier.courierTypesAvailable")}{" "}
              </span>

              <span className="rounded-full bg-red-100 px-8 py-3 text-sm font-medium text-red-600">
                {totalViolations} {t("courier.violationsTypesCount")}
              </span>
            </div>
            <ChevronIcon open={mainOpen} />
          </button>
        </section>

        {mainOpen && (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {violationCategories.map((category) => (
                <CategoryAccordion
                  key={category.id}
                  category={category}
                  isOpen={openCategoryId === category.id}
                  onClick={() => handleCategoryClick(category.id)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ViolationTypes;
