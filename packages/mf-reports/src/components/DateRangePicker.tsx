import React, { useEffect, useRef, useState } from "react";

export interface DateRange {
  start: Date | null;
  end: Date | null;
}

interface Props {
  value: DateRange;
  onChange: (r: DateRange) => void;
  startLabel?: string;
  endLabel?: string;
  isRtl?: boolean;
}

// Arabic month names (Gregorian)
const AR_MONTHS = [
  "يناير",
  "فبراير",
  "مارس",
  "أبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

// Ordered Sun–Sat to match JS getDay() (0=Sun). In RTL grid, DOM[0] appears on the right.
// So: أحد (Sun) → rightmost column, سبت (Sat) → leftmost column.
const AR_DAYS = ["أحد", "اثن", "ثلاث", "أربع", "خميس", "جمعة", "سبت"];

function fmt(d: Date | null): string {
  if (!d) return "";
  return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
}

function sameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

function inRange(date: Date, s: Date | null, e: Date | null): boolean {
  if (!s || !e) return false;
  return date.getTime() > s.getTime() && date.getTime() < e.getTime();
}

function daysInMonth(y: number, m: number): number {
  return new Date(y, m + 1, 0).getDate();
}

type Cell = { date: Date; cur: boolean };

const CalIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className="text-neutral-400 flex-shrink-0"
  >
    <rect
      x="2"
      y="3"
      width="12"
      height="11"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <path
      d="M5 1v3M11 1v3M2 7h12"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

const ChevLeft = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path
      d="M10 12L6 8l4-4"
      stroke="#1e3a8a"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const DateRangePicker: React.FC<Props> = ({
  value,
  onChange,
  startLabel = "الفترة الزمنية",
  endLabel = "تاريخ النهاية",
  isRtl = false,
}) => {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [picking, setPicking] = useState<"start" | "end">("start");
  const [vy, setVy] = useState(today.getFullYear());
  const [vm, setVm] = useState(today.getMonth());
  const [hover, setHover] = useState<Date | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Build calendar cells
  const dim = daysInMonth(vy, vm);
  const firstWd = new Date(vy, vm, 1).getDay(); // 0 = Sunday
  const prevDim = daysInMonth(vy, vm - 1);

  const cells: Cell[] = [];
  for (let i = firstWd - 1; i >= 0; i--)
    cells.push({ date: new Date(vy, vm - 1, prevDim - i), cur: false });
  for (let d = 1; d <= dim; d++)
    cells.push({ date: new Date(vy, vm, d), cur: true });
  const fill = Math.ceil(cells.length / 7) * 7 - cells.length;
  for (let d = 1; d <= fill; d++)
    cells.push({ date: new Date(vy, vm + 1, d), cur: false });

  const weeks: Cell[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

  const openFor = (mode: "start" | "end") => {
    setPicking(mode);
    setOpen(true);
  };

  const clickDay = (date: Date) => {
    if (picking === "start") {
      onChange({ start: date, end: null });
      setPicking("end");
    } else {
      const { start } = value;
      if (start && date.getTime() < start.getTime()) {
        onChange({ start: date, end: start });
      } else {
        onChange({ start, end: date });
      }
      setOpen(false);
      setPicking("start");
    }
  };

  // Navigation: in RTL layout, DOM-first button appears on the RIGHT (= prev month).
  // DOM-last button appears on the LEFT (= next month).
  const prevMonth = () => {
    if (vm === 0) {
      setVm(11);
      setVy((y) => y - 1);
    } else {
      setVm((m) => m - 1);
    }
  };
  const nextMonth = () => {
    if (vm === 11) {
      setVm(0);
      setVy((y) => y + 1);
    } else {
      setVm((m) => m + 1);
    }
  };

  const cellClass = ({ date, cur }: Cell): string => {
    if (!cur)
      return "w-8 h-8 flex items-center justify-center text-sm text-slate-300 select-none";
    const isStart = value.start && sameDay(date, value.start);
    const isEnd = value.end && sameDay(date, value.end);
    const ranged = inRange(date, value.start, value.end);
    const hovered =
      hover &&
      value.start &&
      !value.end &&
      date.getTime() > value.start.getTime() &&
      date.getTime() <= hover.getTime();

    if (isStart || isEnd)
      return "w-8 h-8 flex items-center justify-center text-sm bg-indigo-700 text-white rounded-full cursor-pointer select-none z-10 relative";
    if (ranged || hovered)
      return "w-8 h-8 flex items-center justify-center text-sm text-neutral-800 cursor-pointer select-none";
    return "w-8 h-8 flex items-center justify-center text-sm text-neutral-800 rounded cursor-pointer select-none hover:bg-slate-50 hover:outline hover:outline-1 hover:outline-offset-[-1px] hover:outline-gray-400";
  };

  const rowHasRange = (week: Cell[]): boolean =>
    week.some((c) => {
      if (!c.cur) return false;
      const ranged = inRange(c.date, value.start, value.end);
      const hovered =
        hover &&
        value.start &&
        !value.end &&
        c.date.getTime() > value.start.getTime() &&
        c.date.getTime() <= hover.getTime();
      return !!(ranged || hovered);
    });

  return (
    <div ref={ref} className="relative">
      {/* Two date inputs */}
      <div className="grid grid-cols-2 gap-3">
        {/* Start */}
        <div>
          <div className={`text-sm font-bold text-black mb-2 font-['Cairo'] ${isRtl ? 'text-right' : 'text-left'}`}>
            {startLabel}
          </div>
          {/* dir="ltr" keeps icon left, date text left regardless of page direction */}
          <div
            dir="ltr"
            onClick={() => openFor("start")}
            className={`h-12 px-4 bg-neutral-100 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
              open && picking === "start" ? "ring-2 ring-indigo-600 bg-white" : "hover:outline hover:outline-1 hover:outline-indigo-200"
            }`}
          >
            <CalIcon />
            <span className="text-xs text-neutral-400 font-['Inter'] tracking-wide flex-1">
              {value.start ? fmt(value.start) : "mm/dd/yyyy"}
            </span>
          </div>
        </div>
        {/* End */}
        <div>
          <div className={`text-sm font-bold text-black mb-2 font-['Cairo'] ${isRtl ? 'text-right' : 'text-left'}`}>
            {endLabel}
          </div>
          {/* dir="ltr" keeps icon left, date text left regardless of page direction */}
          <div
            dir="ltr"
            onClick={() => openFor("end")}
            className={`h-12 px-4 bg-neutral-100 rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
              open && picking === "end" ? "ring-2 ring-indigo-600 bg-white" : "hover:outline hover:outline-1 hover:outline-indigo-200"
            }`}
          >
            <CalIcon />
            <span className="text-xs text-neutral-400 font-['Inter'] tracking-wide flex-1">
              {value.end ? fmt(value.end) : "mm/dd/yyyy"}
            </span>
          </div>
        </div>
      </div>

      {/* Calendar popup */}
      {open && (
        <div
          className="absolute top-full mt-1 right-0 z-50 bg-white rounded-xl border border-indigo-200 shadow-lg py-2"
          style={{ width: 316 }}
          dir={isRtl ? "rtl" : "ltr"}
        >
          {/* Month navigation
              DOM order inside justify-between with dir="rtl":
              first child → rightmost → prev month (rotate-180 makes chevron point right →)
              last child  → leftmost  → next month (chevron points left ←)             */}
          <div className="flex items-center justify-between px-6 py-2">
            <button
              onClick={prevMonth}
              className="p-2 rounded hover:bg-gray-50 rotate-180"
              aria-label="الشهر السابق"
            >
              <ChevLeft />
            </button>
            <span className="text-indigo-700 text-lg font-normal font-['Cairo']">
              {AR_MONTHS[vm]}&nbsp;{vy}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 rounded hover:bg-gray-50"
              aria-label="الشهر التالي"
            >
              <ChevLeft />
            </button>
          </div>

          {/* Day headers — RTL grid: أحد (Sun, index 0) appears on the far right */}
          <div className="grid grid-cols-7 px-6">
            {AR_DAYS.map((d) => (
              <div
                key={d}
                className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm font-['Cairo']"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div
              key={wi}
              className={`grid grid-cols-7 px-6 rounded ${
                rowHasRange(week) ? "bg-indigo-50" : ""
              }`}
            >
              {week.map((cell, di) => (
                <div
                  key={di}
                  className={cellClass(cell)}
                  onClick={() => cell.cur && clickDay(cell.date)}
                  onMouseEnter={() => setHover(cell.date)}
                  onMouseLeave={() => setHover(null)}
                >
                  {cell.date.getDate()}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
