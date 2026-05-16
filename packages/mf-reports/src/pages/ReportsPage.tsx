import React, { useState, useMemo } from "react";
import { KpiCard, ForbiddenPage } from "@ops-brain/shared";
import type { ReportCardData } from "../types/report.types";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import "../lib/registerTranslations";
import "../index.css";

interface ReportsPageProps {
  onNavigate?: (id: string) => void;
}

type PeriodFilter = "all" | "يومي" | "أسبوعي" | "شهري";
type ViewMode = "grid" | "list";

const CARDS_PER_PAGE = 6;

const sampleReports: ReportCardData[] = [
  // ── Page 1 ───────────────────────────────────────────────────────────────
  {
    title: "تقرير الأداء اليومي",
    id: "RPT-001",
    status: "مكتمل",
    statusScheme: "good",
    date: "5 أبريل 2026",
    tags: [{ label: "كيتا", variant: "orange" }, { label: "يومي", variant: "blue" }],
    stats: [
      { label: "السجلات",   value: 194,  color: "#191C1E", unit: "سجل"    },
      { label: "الطلبات",   value: 422,  color: "#1E3A8A", unit: "طلب"    },
      { label: "المخالفات", value: 12,   color: "#F97316", unit: "مخالفة" },
      { label: "التحذيرات", value: 3,    color: "#C0392B", unit: "تحذير"  },
    ],
    sla: { percent: 87.3, statusLabel: "قريب", slaScheme: "average", slaLabel: "نسبة SLA", targetPercent: 90, targetLabel: "الهدف 90%", minLabel: "0%", maxLabel: "100%" },
    owner: { name: "محمد العمري", initial: "م" },
    meta: "09:14  MB 2.4",
    dir: "rtl",
    modal: { detailsLabel: "تفاصيل التقرير", details: [{ label: "التاريخ", value: "5 أبريل 2026 — 09:14", icon: "calendar" }, { label: "الاسم الكامل", value: "محمد العمري", icon: "user" }, { label: "حجم الملف", value: "2.4 MB", icon: "file" }, { label: "معرف التقرير", value: "RPT-001", icon: "id" }], pdfLabel: "تحميل PDF", csvLabel: "تصدير CSV" },
  },
  {
    title: "تقرير المخالفات الأسبوعي",
    id: "RPT-002",
    status: "تحذير",
    statusScheme: "average",
    date: "4 أبريل 2026",
    tags: [{ label: "هنقرستيشن", variant: "orange" }, { label: "أسبوعي", variant: "purple" }],
    stats: [
      { label: "السجلات",   value: 286, color: "#191C1E", unit: "سجل"    },
      { label: "الطلبات",   value: 315, color: "#1E3A8A", unit: "طلب"    },
      { label: "المخالفات", value: 18,  color: "#F97316", unit: "مخالفة" },
      { label: "التحذيرات", value: 8,   color: "#C0392B", unit: "تحذير"  },
    ],
    sla: { percent: 81.3, statusLabel: "قريب", slaScheme: "average", slaLabel: "نسبة SLA", targetPercent: 90, targetLabel: "الهدف 90%", minLabel: "0%", maxLabel: "100%" },
    owner: { name: "خالد العتيبي", initial: "خ" },
    meta: "08:00  MB 4.1",
    dir: "rtl",
    modal: { detailsLabel: "تفاصيل التقرير", details: [{ label: "التاريخ", value: "4 أبريل 2026 — 08:00", icon: "calendar" }, { label: "الاسم الكامل", value: "خالد العتيبي", icon: "user" }, { label: "حجم الملف", value: "4.1 MB", icon: "file" }, { label: "معرف التقرير", value: "RPT-002", icon: "id" }], alert: { title: "8 تحذيرات تحتاج مراجعة", description: "بيانات في هذا التقرير تحتاج مراجعة يدوية قبل اتخاذ قرارات تشغيلية." }, pdfLabel: "تحميل PDF", csvLabel: "تصدير CSV" },
  },
  {
    title: "تقرير أداء المناديب",
    id: "RPT-003",
    status: "تحذير",
    statusScheme: "average",
    date: "5 أبريل 2026",
    tags: [{ label: "جاهز", variant: "blue" }, { label: "يومي", variant: "blue" }],
    stats: [
      { label: "السجلات",   value: 43,  color: "#191C1E", unit: "سجل"    },
      { label: "الطلبات",   value: 205, color: "#1E3A8A", unit: "طلب"    },
      { label: "المخالفات", value: 8,   color: "#F97316", unit: "مخالفة" },
      { label: "التحذيرات", value: 5,   color: "#C0392B", unit: "تحذير"  },
    ],
    sla: { percent: 49, statusLabel: "أقل الهدف", slaScheme: "bad", slaLabel: "نسبة SLA", targetPercent: 90, targetLabel: "الهدف 90%", minLabel: "0%", maxLabel: "100%" },
    owner: { name: "أحمد منصور", initial: "أ" },
    meta: "03:55  MB 1.8",
    dir: "rtl",
    modal: { detailsLabel: "تفاصيل التقرير", details: [{ label: "التاريخ", value: "5 أبريل 2026 — 03:55", icon: "calendar" }, { label: "الاسم الكامل", value: "أحمد منصور", icon: "user" }, { label: "حجم الملف", value: "1.8 MB", icon: "file" }, { label: "معرف التقرير", value: "RPT-003", icon: "id" }], alert: { title: "SLA أقل من الهدف المطلوب", description: "نسبة الخدمة أقل من 90% — يُنصح بمراجعة بيانات الأداء وتحديد أسباب الانخفاض." }, pdfLabel: "تحميل PDF", csvLabel: "تصدير CSV" },
  },
  {
    title: "تقرير SLA الشهري",
    id: "RPT-004",
    status: "مكتمل",
    statusScheme: "good",
    date: "1 أبريل 2026",
    tags: [{ label: "كيتا", variant: "orange" }, { label: "شهري", variant: "blue" }],
    stats: [
      { label: "السجلات",   value: 473,  color: "#191C1E", unit: "سجل"    },
      { label: "الطلبات",   value: 1247, color: "#1E3A8A", unit: "طلب"    },
      { label: "المخالفات", value: 35,   color: "#F97316", unit: "مخالفة" },
      { label: "التحذيرات", value: 0,    color: "#C0392B", unit: "تحذير"  },
    ],
    sla: { percent: 91.2, statusLabel: "فوق الهدف", slaScheme: "good", slaLabel: "نسبة SLA", targetPercent: 90, targetLabel: "الهدف 90%", minLabel: "0%", maxLabel: "100%" },
    owner: { name: "محمد العمري", initial: "م" },
    meta: "07:00  MB 8.7",
    dir: "rtl",
    modal: { detailsLabel: "تفاصيل التقرير", details: [{ label: "التاريخ", value: "1 أبريل 2026 — 07:00", icon: "calendar" }, { label: "الاسم الكامل", value: "محمد العمري", icon: "user" }, { label: "حجم الملف", value: "8.7 MB", icon: "file" }, { label: "معرف التقرير", value: "RPT-004", icon: "id" }], pdfLabel: "تحميل PDF", csvLabel: "تصدير CSV" },
  },
  {
    title: "تقرير المخالفات — أسبوع 1",
    id: "RPT-005",
    status: "تحذير",
    statusScheme: "average",
    date: "31 مارس 2026",
    tags: [{ label: "هنقرستيشن", variant: "orange" }, { label: "أسبوعي", variant: "purple" }],
    stats: [
      { label: "السجلات",   value: 534, color: "#191C1E", unit: "سجل"    },
      { label: "الطلبات",   value: 890, color: "#1E3A8A", unit: "طلب"    },
      { label: "المخالفات", value: 22,  color: "#F97316", unit: "مخالفة" },
      { label: "التحذيرات", value: 11,  color: "#C0392B", unit: "تحذير"  },
    ],
    sla: { percent: 83.7, statusLabel: "قريب", slaScheme: "average", slaLabel: "نسبة SLA", targetPercent: 90, targetLabel: "الهدف 90%", minLabel: "0%", maxLabel: "100%" },
    owner: { name: "يوسف علي", initial: "ي" },
    meta: "08:55  MB 5.2",
    dir: "rtl",
    modal: { detailsLabel: "تفاصيل التقرير", details: [{ label: "التاريخ", value: "31 مارس 2026 — 08:55", icon: "calendar" }, { label: "الاسم الكامل", value: "يوسف علي", icon: "user" }, { label: "حجم الملف", value: "5.2 MB", icon: "file" }, { label: "معرف التقرير", value: "RPT-005", icon: "id" }], pdfLabel: "تحميل PDF", csvLabel: "تصدير CSV" },
  },
  {
    title: "تقرير الكفاءة التشغيلية",
    id: "RPT-006",
    status: "خطأ",
    statusScheme: "bad",
    date: "21 مارس 2026",
    tags: [{ label: "جاهز", variant: "blue" }, { label: "شهري", variant: "blue" }],
    stats: [
      { label: "السجلات",   value: null, color: "#191C1E" },
      { label: "الطلبات",   value: null, color: "#1E3A8A" },
      { label: "المخالفات", value: null, color: "#F97316" },
      { label: "التحذيرات", value: null, color: "#C0392B" },
    ],
    errorMessage: "فشل في معالجة الملف — يحتاج إعادة رفع",
    owner: { name: "النظام", initial: "ن" },
    meta: "09:00",
    dir: "rtl",
    modal: { detailsLabel: "تفاصيل التقرير", details: [{ label: "التاريخ", value: "21 مارس 2026 — 09:00", icon: "calendar" }, { label: "الاسم الكامل", value: "النظام", icon: "user" }, { label: "معرف التقرير", value: "RPT-006", icon: "id" }], alert: { title: "فشل في معالجة الملف", description: "حدث خطأ أثناء معالجة الملف. يُرجى إعادة رفع الملف والمحاولة مجدداً." }, csvLabel: "إعادة رفع" },
  },

  // ── Page 2 ───────────────────────────────────────────────────────────────
  {
    title: "تقرير توزيع الطلبات الأسبوعي",
    id: "RPT-007",
    status: "مكتمل",
    statusScheme: "good",
    date: "28 مارس 2026",
    tags: [{ label: "كيتا", variant: "orange" }, { label: "أسبوعي", variant: "purple" }],
    stats: [
      { label: "السجلات",   value: 312, color: "#191C1E", unit: "سجل"    },
      { label: "الطلبات",   value: 678, color: "#1E3A8A", unit: "طلب"    },
      { label: "المخالفات", value: 7,   color: "#F97316", unit: "مخالفة" },
      { label: "التحذيرات", value: 1,   color: "#C0392B", unit: "تحذير"  },
    ],
    sla: { percent: 93.5, statusLabel: "فوق الهدف", slaScheme: "good", slaLabel: "نسبة SLA", targetPercent: 90, targetLabel: "الهدف 90%", minLabel: "0%", maxLabel: "100%" },
    owner: { name: "سارة القحطاني", initial: "س" },
    meta: "07:30  MB 3.6",
    dir: "rtl",
    modal: { detailsLabel: "تفاصيل التقرير", details: [{ label: "التاريخ", value: "28 مارس 2026 — 07:30", icon: "calendar" }, { label: "الاسم الكامل", value: "سارة القحطاني", icon: "user" }, { label: "حجم الملف", value: "3.6 MB", icon: "file" }, { label: "معرف التقرير", value: "RPT-007", icon: "id" }], pdfLabel: "تحميل PDF", csvLabel: "تصدير CSV" },
  },
  {
    title: "تقرير الأداء الشهري — مارس",
    id: "RPT-008",
    status: "مكتمل",
    statusScheme: "good",
    date: "1 مارس 2026",
    tags: [{ label: "هنقرستيشن", variant: "orange" }, { label: "شهري", variant: "blue" }],
    stats: [
      { label: "السجلات",   value: 921,  color: "#191C1E", unit: "سجل"    },
      { label: "الطلبات",   value: 2103, color: "#1E3A8A", unit: "طلب"    },
      { label: "المخالفات", value: 41,   color: "#F97316", unit: "مخالفة" },
      { label: "التحذيرات", value: 4,    color: "#C0392B", unit: "تحذير"  },
    ],
    sla: { percent: 94.8, statusLabel: "فوق الهدف", slaScheme: "good", slaLabel: "نسبة SLA", targetPercent: 90, targetLabel: "الهدف 90%", minLabel: "0%", maxLabel: "100%" },
    owner: { name: "فهد الدوسري", initial: "ف" },
    meta: "06:00  MB 12.3",
    dir: "rtl",
    modal: { detailsLabel: "تفاصيل التقرير", details: [{ label: "التاريخ", value: "1 مارس 2026 — 06:00", icon: "calendar" }, { label: "الاسم الكامل", value: "فهد الدوسري", icon: "user" }, { label: "حجم الملف", value: "12.3 MB", icon: "file" }, { label: "معرف التقرير", value: "RPT-008", icon: "id" }], pdfLabel: "تحميل PDF", csvLabel: "تصدير CSV" },
  },
  {
    title: "تقرير التأخير اليومي",
    id: "RPT-009",
    status: "تحذير",
    statusScheme: "average",
    date: "3 أبريل 2026",
    tags: [{ label: "جاهز", variant: "blue" }, { label: "يومي", variant: "blue" }],
    stats: [
      { label: "السجلات",   value: 88,  color: "#191C1E", unit: "سجل"    },
      { label: "الطلبات",   value: 174, color: "#1E3A8A", unit: "طلب"    },
      { label: "المخالفات", value: 29,  color: "#F97316", unit: "مخالفة" },
      { label: "التحذيرات", value: 14,  color: "#C0392B", unit: "تحذير"  },
    ],
    sla: { percent: 72.1, statusLabel: "أقل الهدف", slaScheme: "bad", slaLabel: "نسبة SLA", targetPercent: 90, targetLabel: "الهدف 90%", minLabel: "0%", maxLabel: "100%" },
    owner: { name: "نورة الشمري", initial: "ن" },
    meta: "10:05  MB 2.1",
    dir: "rtl",
    modal: { detailsLabel: "تفاصيل التقرير", details: [{ label: "التاريخ", value: "3 أبريل 2026 — 10:05", icon: "calendar" }, { label: "الاسم الكامل", value: "نورة الشمري", icon: "user" }, { label: "حجم الملف", value: "2.1 MB", icon: "file" }, { label: "معرف التقرير", value: "RPT-009", icon: "id" }], alert: { title: "29 مخالفة — مراجعة عاجلة", description: "عدد المخالفات تجاوز الحد المسموح، يُنصح باتخاذ إجراء تصحيحي فوري." }, pdfLabel: "تحميل PDF", csvLabel: "تصدير CSV" },
  },
  {
    title: "تقرير المناديب — الأسبوع الثاني",
    id: "RPT-010",
    status: "مكتمل",
    statusScheme: "good",
    date: "14 مارس 2026",
    tags: [{ label: "كيتا", variant: "orange" }, { label: "أسبوعي", variant: "purple" }],
    stats: [
      { label: "السجلات",   value: 265, color: "#191C1E", unit: "سجل"    },
      { label: "الطلبات",   value: 540, color: "#1E3A8A", unit: "طلب"    },
      { label: "المخالفات", value: 9,   color: "#F97316", unit: "مخالفة" },
      { label: "التحذيرات", value: 2,   color: "#C0392B", unit: "تحذير"  },
    ],
    sla: { percent: 90.0, statusLabel: "مطابق الهدف", slaScheme: "good", slaLabel: "نسبة SLA", targetPercent: 90, targetLabel: "الهدف 90%", minLabel: "0%", maxLabel: "100%" },
    owner: { name: "عمر الزهراني", initial: "ع" },
    meta: "08:20  MB 4.9",
    dir: "rtl",
    modal: { detailsLabel: "تفاصيل التقرير", details: [{ label: "التاريخ", value: "14 مارس 2026 — 08:20", icon: "calendar" }, { label: "الاسم الكامل", value: "عمر الزهراني", icon: "user" }, { label: "حجم الملف", value: "4.9 MB", icon: "file" }, { label: "معرف التقرير", value: "RPT-010", icon: "id" }], pdfLabel: "تحميل PDF", csvLabel: "تصدير CSV" },
  },
  {
    title: "تقرير حجم الشحنات اليومي",
    id: "RPT-011",
    status: "مكتمل",
    statusScheme: "good",
    date: "2 أبريل 2026",
    tags: [{ label: "هنقرستيشن", variant: "orange" }, { label: "يومي", variant: "blue" }],
    stats: [
      { label: "السجلات",   value: 147, color: "#191C1E", unit: "سجل"    },
      { label: "الطلبات",   value: 309, color: "#1E3A8A", unit: "طلب"    },
      { label: "المخالفات", value: 4,   color: "#F97316", unit: "مخالفة" },
      { label: "التحذيرات", value: 0,   color: "#C0392B", unit: "تحذير"  },
    ],
    sla: { percent: 96.2, statusLabel: "فوق الهدف", slaScheme: "good", slaLabel: "نسبة SLA", targetPercent: 90, targetLabel: "الهدف 90%", minLabel: "0%", maxLabel: "100%" },
    owner: { name: "ريم الحربي", initial: "ر" },
    meta: "07:45  MB 1.7",
    dir: "rtl",
    modal: { detailsLabel: "تفاصيل التقرير", details: [{ label: "التاريخ", value: "2 أبريل 2026 — 07:45", icon: "calendar" }, { label: "الاسم الكامل", value: "ريم الحربي", icon: "user" }, { label: "حجم الملف", value: "1.7 MB", icon: "file" }, { label: "معرف التقرير", value: "RPT-011", icon: "id" }], pdfLabel: "تحميل PDF", csvLabel: "تصدير CSV" },
  },
  {
    title: "تقرير التسليم المتأخر — أسبوع 3",
    id: "RPT-012",
    status: "خطأ",
    statusScheme: "bad",
    date: "20 مارس 2026",
    tags: [{ label: "جاهز", variant: "blue" }, { label: "أسبوعي", variant: "purple" }],
    stats: [
      { label: "السجلات",   value: null, color: "#191C1E" },
      { label: "الطلبات",   value: null, color: "#1E3A8A" },
      { label: "المخالفات", value: null, color: "#F97316" },
      { label: "التحذيرات", value: null, color: "#C0392B" },
    ],
    errorMessage: "انتهت مهلة المعالجة — يُرجى إعادة المحاولة",
    owner: { name: "النظام", initial: "ن" },
    meta: "11:00",
    dir: "rtl",
    modal: { detailsLabel: "تفاصيل التقرير", details: [{ label: "التاريخ", value: "20 مارس 2026 — 11:00", icon: "calendar" }, { label: "معرف التقرير", value: "RPT-012", icon: "id" }], alert: { title: "انتهت مهلة المعالجة", description: "تجاوز الملف الحد الزمني للمعالجة، يُرجى إعادة الرفع أو التواصل مع الدعم." }, csvLabel: "إعادة رفع" },
  },

  // ── Page 3 ───────────────────────────────────────────────────────────────
  {
    title: "تقرير الأداء الأسبوعي — فبراير",
    id: "RPT-013",
    status: "مكتمل",
    statusScheme: "good",
    date: "28 فبراير 2026",
    tags: [{ label: "كيتا", variant: "orange" }, { label: "أسبوعي", variant: "purple" }],
    stats: [
      { label: "السجلات",   value: 402, color: "#191C1E", unit: "سجل"    },
      { label: "الطلبات",   value: 834, color: "#1E3A8A", unit: "طلب"    },
      { label: "المخالفات", value: 13,  color: "#F97316", unit: "مخالفة" },
      { label: "التحذيرات", value: 2,   color: "#C0392B", unit: "تحذير"  },
    ],
    sla: { percent: 92.0, statusLabel: "فوق الهدف", slaScheme: "good", slaLabel: "نسبة SLA", targetPercent: 90, targetLabel: "الهدف 90%", minLabel: "0%", maxLabel: "100%" },
    owner: { name: "بدر المطيري", initial: "ب" },
    meta: "06:50  MB 6.2",
    dir: "rtl",
    modal: { detailsLabel: "تفاصيل التقرير", details: [{ label: "التاريخ", value: "28 فبراير 2026 — 06:50", icon: "calendar" }, { label: "الاسم الكامل", value: "بدر المطيري", icon: "user" }, { label: "حجم الملف", value: "6.2 MB", icon: "file" }, { label: "معرف التقرير", value: "RPT-013", icon: "id" }], pdfLabel: "تحميل PDF", csvLabel: "تصدير CSV" },
  },
  {
    title: "تقرير SLA — فبراير",
    id: "RPT-014",
    status: "تحذير",
    statusScheme: "average",
    date: "1 فبراير 2026",
    tags: [{ label: "هنقرستيشن", variant: "orange" }, { label: "شهري", variant: "blue" }],
    stats: [
      { label: "السجلات",   value: 756,  color: "#191C1E", unit: "سجل"    },
      { label: "الطلبات",   value: 1580, color: "#1E3A8A", unit: "طلب"    },
      { label: "المخالفات", value: 52,   color: "#F97316", unit: "مخالفة" },
      { label: "التحذيرات", value: 17,   color: "#C0392B", unit: "تحذير"  },
    ],
    sla: { percent: 85.4, statusLabel: "قريب", slaScheme: "average", slaLabel: "نسبة SLA", targetPercent: 90, targetLabel: "الهدف 90%", minLabel: "0%", maxLabel: "100%" },
    owner: { name: "محمد العمري", initial: "م" },
    meta: "07:10  MB 9.8",
    dir: "rtl",
    modal: { detailsLabel: "تفاصيل التقرير", details: [{ label: "التاريخ", value: "1 فبراير 2026 — 07:10", icon: "calendar" }, { label: "الاسم الكامل", value: "محمد العمري", icon: "user" }, { label: "حجم الملف", value: "9.8 MB", icon: "file" }, { label: "معرف التقرير", value: "RPT-014", icon: "id" }], alert: { title: "17 تحذيراً بحاجة مراجعة", description: "تجاوز عدد التحذيرات الحد الطبيعي في هذا الشهر." }, pdfLabel: "تحميل PDF", csvLabel: "تصدير CSV" },
  },
  {
    title: "تقرير التوصيل اليومي",
    id: "RPT-015",
    status: "مكتمل",
    statusScheme: "good",
    date: "1 أبريل 2026",
    tags: [{ label: "جاهز", variant: "blue" }, { label: "يومي", variant: "blue" }],
    stats: [
      { label: "السجلات",   value: 211, color: "#191C1E", unit: "سجل"    },
      { label: "الطلبات",   value: 488, color: "#1E3A8A", unit: "طلب"    },
      { label: "المخالفات", value: 6,   color: "#F97316", unit: "مخالفة" },
      { label: "التحذيرات", value: 0,   color: "#C0392B", unit: "تحذير"  },
    ],
    sla: { percent: 97.1, statusLabel: "فوق الهدف", slaScheme: "good", slaLabel: "نسبة SLA", targetPercent: 90, targetLabel: "الهدف 90%", minLabel: "0%", maxLabel: "100%" },
    owner: { name: "سارة القحطاني", initial: "س" },
    meta: "08:00  MB 2.9",
    dir: "rtl",
    modal: { detailsLabel: "تفاصيل التقرير", details: [{ label: "التاريخ", value: "1 أبريل 2026 — 08:00", icon: "calendar" }, { label: "الاسم الكامل", value: "سارة القحطاني", icon: "user" }, { label: "حجم الملف", value: "2.9 MB", icon: "file" }, { label: "معرف التقرير", value: "RPT-015", icon: "id" }], pdfLabel: "تحميل PDF", csvLabel: "تصدير CSV" },
  },
  {
    title: "تقرير المناطق — الربع الأول",
    id: "RPT-016",
    status: "مكتمل",
    statusScheme: "good",
    date: "31 مارس 2026",
    tags: [{ label: "كيتا", variant: "orange" }, { label: "شهري", variant: "blue" }],
    stats: [
      { label: "السجلات",   value: 1840, color: "#191C1E", unit: "سجل"    },
      { label: "الطلبات",   value: 4230, color: "#1E3A8A", unit: "طلب"    },
      { label: "المخالفات", value: 98,   color: "#F97316", unit: "مخالفة" },
      { label: "التحذيرات", value: 12,   color: "#C0392B", unit: "تحذير"  },
    ],
    sla: { percent: 91.7, statusLabel: "فوق الهدف", slaScheme: "good", slaLabel: "نسبة SLA", targetPercent: 90, targetLabel: "الهدف 90%", minLabel: "0%", maxLabel: "100%" },
    owner: { name: "عمر الزهراني", initial: "ع" },
    meta: "06:30  MB 22.4",
    dir: "rtl",
    modal: { detailsLabel: "تفاصيل التقرير", details: [{ label: "التاريخ", value: "31 مارس 2026 — 06:30", icon: "calendar" }, { label: "الاسم الكامل", value: "عمر الزهراني", icon: "user" }, { label: "حجم الملف", value: "22.4 MB", icon: "file" }, { label: "معرف التقرير", value: "RPT-016", icon: "id" }], pdfLabel: "تحميل PDF", csvLabel: "تصدير CSV" },
  },
  {
    title: "تقرير الأخطاء الأسبوعي",
    id: "RPT-017",
    status: "تحذير",
    statusScheme: "average",
    date: "7 مارس 2026",
    tags: [{ label: "هنقرستيشن", variant: "orange" }, { label: "أسبوعي", variant: "purple" }],
    stats: [
      { label: "السجلات",   value: 178, color: "#191C1E", unit: "سجل"    },
      { label: "الطلبات",   value: 356, color: "#1E3A8A", unit: "طلب"    },
      { label: "المخالفات", value: 33,  color: "#F97316", unit: "مخالفة" },
      { label: "التحذيرات", value: 19,  color: "#C0392B", unit: "تحذير"  },
    ],
    sla: { percent: 78.9, statusLabel: "أقل الهدف", slaScheme: "bad", slaLabel: "نسبة SLA", targetPercent: 90, targetLabel: "الهدف 90%", minLabel: "0%", maxLabel: "100%" },
    owner: { name: "فهد الدوسري", initial: "ف" },
    meta: "09:30  MB 4.4",
    dir: "rtl",
    modal: { detailsLabel: "تفاصيل التقرير", details: [{ label: "التاريخ", value: "7 مارس 2026 — 09:30", icon: "calendar" }, { label: "الاسم الكامل", value: "فهد الدوسري", icon: "user" }, { label: "حجم الملف", value: "4.4 MB", icon: "file" }, { label: "معرف التقرير", value: "RPT-017", icon: "id" }], alert: { title: "SLA أقل من الهدف بشكل ملحوظ", description: "يُنصح بتحليل أسباب الانخفاض الحاد في نسبة الخدمة هذا الأسبوع." }, pdfLabel: "تحميل PDF", csvLabel: "تصدير CSV" },
  },
  {
    title: "تقرير الأداء الشهري — يناير",
    id: "RPT-018",
    status: "مكتمل",
    statusScheme: "good",
    date: "1 يناير 2026",
    tags: [{ label: "جاهز", variant: "blue" }, { label: "شهري", variant: "blue" }],
    stats: [
      { label: "السجلات",   value: 1102, color: "#191C1E", unit: "سجل"    },
      { label: "الطلبات",   value: 2544, color: "#1E3A8A", unit: "طلب"    },
      { label: "المخالفات", value: 27,   color: "#F97316", unit: "مخالفة" },
      { label: "التحذيرات", value: 3,    color: "#C0392B", unit: "تحذير"  },
    ],
    sla: { percent: 95.3, statusLabel: "فوق الهدف", slaScheme: "good", slaLabel: "نسبة SLA", targetPercent: 90, targetLabel: "الهدف 90%", minLabel: "0%", maxLabel: "100%" },
    owner: { name: "ريم الحربي", initial: "ر" },
    meta: "06:00  MB 15.1",
    dir: "rtl",
    modal: { detailsLabel: "تفاصيل التقرير", details: [{ label: "التاريخ", value: "1 يناير 2026 — 06:00", icon: "calendar" }, { label: "الاسم الكامل", value: "ريم الحربي", icon: "user" }, { label: "حجم الملف", value: "15.1 MB", icon: "file" }, { label: "معرف التقرير", value: "RPT-018", icon: "id" }], pdfLabel: "تحميل PDF", csvLabel: "تصدير CSV" },
  },
];

// ─── Pagination ──────────────────────────────────────────────────────────────

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  onPageChange,
}) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-between mt-6 px-1" dir={isRtl ? "rtl" : "ltr"}>
      <span className="text-sm text-muted">
        {t("reports.pagination.showing", { totalItems: totalItems, count: sampleReports.length })}
      </span>

      <div className="flex items-center gap-1 bg-white border border-border rounded-xl p-1">
        {/* Prev — right side in RTL */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={isRtl ? "" : "rotate-180"}>
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors
              ${currentPage === page
                ? "bg-primary text-white"
                : "text-dark hover:bg-surface"
              }`}
          >
            {page}
          </button>
        ))}

        {/* Next — left side in RTL */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-muted hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={isRtl ? "" : "rotate-180"}>
            <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

// ─── List row ─────────────────────────────────────────────────────────────────

const statusColor: Record<string, string> = {
  مكتمل: "text-success bg-success-bg",
  تحذير: "text-warning bg-warning-bg",
  خطأ:   "text-danger bg-danger-bg",
};

const ReportListRow: React.FC<{ report: ReportCardData; onView?: () => void }> = ({
  report,
  onView,
}) => {
  const { t } = useTranslation();
  return (
  <div
    className="flex flex-wrap items-center justify-between gap-3 bg-white border border-border rounded-xl px-5 py-3 hover:shadow-sm transition-shadow"
    dir={document.documentElement.dir || "rtl"}
  >
    <div className="flex items-center gap-4 min-w-0">
      <div className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-sm font-bold text-dark shrink-0">
        {report.owner.initial}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-dark text-sm truncate">{report.title}</p>
        <p className="text-xs text-muted">{report.id} · {report.date}</p>
      </div>
    </div>

    <div className="flex flex-wrap items-center gap-2 shrink-0">
      <div className="flex gap-1">
        {report.tags.map((tag, i) => (
          <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-surface text-[#64748B]">
            {tag.label}
          </span>
        ))}
      </div>
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor[report.status] ?? "text-[#64748B] bg-surface"}`}>
        {report.status}
      </span>
      <button
        onClick={onView}
        className="text-xs text-brand-blue hover:underline font-medium"
      >
        {t("reports.view.view_btn", { defaultValue: "عرض" })}
      </button>
    </div>
  </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const ReportsPage: React.FC<ReportsPageProps> = ({ onNavigate }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";
  const navigate = useNavigate();

  const [search, setSearch]         = useState("");
  const [period, setPeriod]         = useState<PeriodFilter>("all");
  const [viewMode, setViewMode]     = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [forbidden, setForbidden]   = useState(false);

  // Dynamically translate mock data for the current language
  const translatedReports = useMemo(() => {
    return sampleReports.map(report => ({
      ...report,
      title: t(`reports.mock.${report.id === 'RPT-001' ? 'dailyPerformance' : 
                                 report.id === 'RPT-002' ? 'weeklyViolations' :
                                 report.id === 'RPT-003' ? 'agentPerformance' :
                                 report.id === 'RPT-004' ? 'monthlySla' :
                                 report.id === 'RPT-005' ? 'violationsWeek1' :
                                 report.id === 'RPT-006' ? 'operationalEfficiency' :
                                 report.id === 'RPT-007' ? 'weeklyOrders' :
                                 report.id === 'RPT-008' ? 'monthlyPerformanceMarch' :
                                 report.id === 'RPT-009' ? 'dailyDelay' :
                                 report.id === 'RPT-010' ? 'agentWeekly2' :
                                 report.id === 'RPT-011' ? 'dailyVolume' :
                                 report.id === 'RPT-012' ? 'lateDeliveryWeek3' :
                                 report.id === 'RPT-013' ? 'weeklyPerformanceFeb' :
                                 report.id === 'RPT-014' ? 'slaFeb' :
                                 report.id === 'RPT-015' ? 'dailyDelivery' :
                                 report.id === 'RPT-016' ? 'regionsQ1' :
                                 report.id === 'RPT-017' ? 'weeklyErrors' :
                                 'monthlyPerformanceJan'}`),
      status: t(`reports.status.${report.status === 'مكتمل' ? 'completed' : report.status === 'تحذير' ? 'warning' : 'error'}`),
      owner: {
        ...report.owner,
        name: report.owner.name === "النظام" ? t("reports.mock.system") : report.owner.name,
      },
      errorMessage: report.errorMessage ? (
        report.errorMessage.includes("فشل في معالجة") ? t("reports.mock.errors.failedProcess") : t("reports.mock.errors.timeout")
      ) : undefined,
      tags: report.tags.map(tag => ({
        ...tag,
        label: t(`reports.filter.${tag.label === 'يومي' ? 'daily' : tag.label === 'أسبوعي' ? 'weekly' : tag.label === 'شهري' ? 'monthly' : tag.label.toLowerCase()}`, { defaultValue: tag.label })
      })),
      stats: report.stats.map(stat => ({
        ...stat,
        label: t(`reports.stats.${stat.label === 'السجلات' ? 'records' : stat.label === 'الطلبات' ? 'orders' : stat.label === 'المخالفات' ? 'violations' : 'warnings'}`),
        unit: stat.unit ? t(`reports.units.${stat.unit === 'سجل' ? 'record' : stat.unit === 'طلب' ? 'order' : stat.unit === 'مخالفة' ? 'violation' : 'warning'}`) : undefined
      })),
      sla: report.sla ? {
        ...report.sla,
        statusLabel: t(`reports.sla.${report.sla.statusLabel === 'قريب' ? 'near' : report.sla.statusLabel === 'أقل الهدف' ? 'belowTarget' : report.sla.statusLabel === 'فوق الهدف' ? 'aboveTarget' : 'matchingTarget'}`),
        slaLabel: t("reports.sla.label"),
        targetLabel: t("reports.sla.target", { percent: report.sla.targetPercent }),
        minLabel: t("reports.sla.min"),
        maxLabel: t("reports.sla.max"),
      } : undefined,
      modal: report.modal ? {
        ...report.modal,
        detailsLabel: t("reports.modal.detailsTitle"),
        details: report.modal.details.map(d => ({
          ...d,
          label: t(`reports.modal.${d.label === 'التاريخ' ? 'date' : d.label === 'الاسم الكامل' ? 'fullName' : d.label === 'حجم الملف' ? 'fileSize' : 'reportId'}`),
          value: d.label === 'الاسم الكامل' && d.value === "النظام" ? t("reports.mock.system") : d.value
        })),
        pdfLabel: t("reports.modal.downloadPdf"),
        csvLabel: report.modal.csvLabel === "إعادة رفع" ? t("reports.modal.reupload") : t("reports.modal.exportCsv"),
        alert: report.modal.alert ? {
          title: t(`reports.mock.alerts.${report.modal.alert.title.includes("تحذير") ? (report.modal.alert.title.includes("8") ? "needReview" : "highWarnings") : 
                                     report.modal.alert.title.includes("SLA") ? (report.modal.alert.title.includes("ملحوظ") ? "sharpDecline" : "lowSla") : 
                                     report.modal.alert.title.includes("مخالفة") ? "urgentReview" : 
                                     report.modal.alert.title.includes("فشل") ? "failedProcess" : "timeout"}`),
          description: t(`reports.mock.alerts.${report.modal.alert.description.includes("يدوية") ? "needReviewDesc" : 
                                              report.modal.alert.description.includes("90%") ? "lowSlaDesc" : 
                                              report.modal.alert.description.includes("تصحيحي") ? "urgentReviewDesc" : 
                                              report.modal.alert.description.includes("الحاد") ? "sharpDeclineDesc" : 
                                              report.modal.alert.description.includes("الطبيعي") ? "highWarningsDesc" : 
                                              report.modal.alert.description.includes("أثناء معالجة") ? "failedProcessDesc" : "timeoutDesc"}`)
        } : undefined
      } : undefined,
      dir: isRtl ? "rtl" : "ltr"
    }));
  }, [t, isRtl]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return translatedReports.filter((r) => {
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q);
      const matchesPeriod =
        period === "all" ||
        r.tags.some((t) => {
          // Check against the untranslated tag label for consistency in filter logic
          const originalTag = sampleReports.find(sr => sr.id === r.id)?.tags.find(tag => tag.label === period);
          return !!originalTag;
        });
      return matchesSearch && matchesPeriod;
    });
  }, [search, period, translatedReports]);

  const totalPages = Math.ceil(filtered.length / CARDS_PER_PAGE);

  // Reset to page 1 whenever filters change
  const handleSearch = (v: string) => { setSearch(v); setCurrentPage(1); };
  const handlePeriod = (v: PeriodFilter) => { setPeriod(v); setCurrentPage(1); };

  const paginated = filtered.slice(
    (currentPage - 1) * CARDS_PER_PAGE,
    currentPage * CARDS_PER_PAGE,
  );

  const periodOptions: { label: string; value: PeriodFilter }[] = [
    { label: t("reports.filter.all"),    value: "all"    },
    { label: t("reports.filter.daily"),   value: "يومي"   },
    { label: t("reports.filter.weekly"), value: "أسبوعي" },
    { label: t("reports.filter.monthly"),   value: "شهري"   },
  ];

  if (forbidden) return <ForbiddenPage onGoBack={() => navigate(-1)} dir={isRtl ? "rtl" : "ltr"} />;

  return (
    <div className="p-6" dir={isRtl ? "rtl" : "ltr"}>

      {/* ── Header ── */}
      <header className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div>
          <h1 className="text-black text-xl font-bold">{t("reports.pageTitle")}</h1>
          <p className="text-sm text-muted mt-0.5">
            {t("reports.todayDate")} &bull; {t("reports.reportsCount", { count: filtered.length })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export */}
          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border-mid bg-white text-sm font-medium text-dark hover:bg-surface transition-colors">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M14 10v2.667A1.333 1.333 0 0 1 12.667 14H3.333A1.333 1.333 0 0 1 2 12.667V10M11.333 5.333 8 2 4.667 5.333M8 2v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t("reports.export")}
          </button>

          {/* Create */}
          <button
            onClick={() => navigate("/reports/add")}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            {t("reports.createReport")}
          </button>
        </div>
      </header>

      {/* ── Filter bar ── */}
      <div className="flex flex-wrap items-center gap-3 mb-6">

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1">
          <button
            onClick={() => setViewMode("grid")}
            title="كروت"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${viewMode === "grid" ? "bg-brand-blue text-white" : "text-[#64748B] hover:text-dark"}`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
              <rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/>
            </svg>
            {t("reports.view.grid")}
          </button>
          <button
            onClick={() => setViewMode("list")}
            title="قائمة"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${viewMode === "list" ? "bg-brand-blue text-white" : "text-[#64748B] hover:text-dark"}`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 3h12M1 7h12M1 11h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            {t("reports.view.list")}
          </button>
        </div>

        {/* Period filter */}
        <div className="flex items-center gap-1 bg-surface border border-border rounded-xl p-1">
          {periodOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handlePeriod(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                ${period === opt.value
                  ? "bg-primary text-white"
                  : "text-[#64748B] hover:text-dark"
                }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="flex-1 min-w-[200px] relative">
          <span className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none`}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.4"/>
              <path d="M10 10.5l3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t("reports.searchPlaceholder")}
            className={`w-full ${isRtl ? 'pr-9 pl-4' : 'pl-9 pr-4'} py-2 rounded-xl border border-border bg-white text-sm text-dark placeholder-border-mid focus:outline-none focus:border-brand-blue transition-colors`}
          />
        </div>
      </div>

      {/* ── Grid / List ── */}
      {paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-[#94A3B8]">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className="mb-3 opacity-40">
            <circle cx="18" cy="18" r="12" stroke="currentColor" strokeWidth="2"/>
            <path d="M27 27l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p className="text-sm">{t("reports.noResults")}</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((report) => (
            <KpiCard
              key={report.id}
              variant="report"
              data={report}
              onView={() => onNavigate?.(report.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {paginated.map((report) => (
            <ReportListRow
              key={report.id}
              report={report}
              onView={() => onNavigate?.(report.id)}
            />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default ReportsPage;
