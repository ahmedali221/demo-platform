import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Truck,
  Upload,
  FileText,
  BarChart2,
  Settings2,
  ChevronDown,
  ChevronsLeft,
  LogOut,
  UserCircle,
  ShieldCheck,
  Bell,
  Palette,
  Users,
  Clock,
  AlertTriangle,
  Target,
  Users2,
  Building2,
  type LucideIcon,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

export type NavItemId =
  | "dashboard"
  | "couriers"
  | "data-import"
  | "import-logs"
  | "reports"
  | "reports-couriers"
  | "reports-companies"
  | "settings"
  | "settings-profile"
  | "settings-security"
  | "settings-notifications"
  | "settings-appearances"
  | "settings-team"
  | "settings-activity"
  | "settings-danger"
  | "settings-sla";

export interface SidebarProps {
  activeItem?: NavItemId;
  onNavigate?: (id: NavItemId) => void;
  onLogout?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

// ── Nav item definitions ───────────────────────────────────────────────────

interface SubNavItem {
  id: NavItemId;
  labelKey: string;
  icon: LucideIcon;
}

interface NavItemDef {
  id: NavItemId;
  labelKey: string;
  icon: LucideIcon;
  subItems?: SubNavItem[];
}

// IDs that belong to each group (controls when the submenu expands)
const DATA_IMPORT_GROUP: NavItemId[] = ["data-import", "import-logs"];
const REPORTS_GROUP: NavItemId[] = ["reports", "reports-couriers", "reports-companies"];
const SETTINGS_GROUP: NavItemId[] = [
  "settings",
  "settings-profile",
  "settings-security",
  "settings-notifications",
  "settings-appearances",
  "settings-team",
  "settings-activity",
  "settings-danger",
  "settings-sla",
];

const COLLAPSED_KEY = "sidebar:collapsed";

// ── Component ──────────────────────────────────────────────────────────────

export default function Sidebar({
  activeItem = "dashboard",
  onNavigate,
  onLogout,
}: SidebarProps) {
  const { t, i18n } = useTranslation();
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSED_KEY) === "true",
  );
  const isRtl = i18n.language === "ar";

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSED_KEY, String(next));
      return next;
    });
  };

  const navItems: NavItemDef[] = [
    {
      id: "dashboard",
      labelKey: "sidebar.dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "couriers",
      labelKey: "sidebar.couriers",
      icon: Truck,
    },
    {
      id: "data-import",
      labelKey: "sidebar.dataImport",
      icon: Upload,
      subItems: [
        { id: "data-import",  labelKey: "sidebar.importFile", icon: Upload },
        { id: "import-logs",  labelKey: "sidebar.importLogs", icon: FileText },
      ],
    },
    {
      id: "reports",
      labelKey: "sidebar.reports",
      icon: BarChart2,
      subItems: [
        { id: "reports-couriers",  labelKey: "sidebar.reportsCouriers",  icon: Users2 },
        { id: "reports-companies", labelKey: "sidebar.reportsCompanies", icon: Building2 },
      ],
    },
    {
      id: "settings",
      labelKey: "sidebar.settings",
      icon: Settings2,
      subItems: [
        { id: "settings-profile",       labelKey: "sidebar.settingsProfile",       icon: UserCircle },
        { id: "settings-security",      labelKey: "sidebar.settingsSecurity",      icon: ShieldCheck },
        { id: "settings-notifications", labelKey: "sidebar.settingsNotifications", icon: Bell },
        { id: "settings-appearances",   labelKey: "sidebar.settingsAppearances",   icon: Palette },
        { id: "settings-team",          labelKey: "sidebar.settingsTeam",          icon: Users },
        { id: "settings-activity",      labelKey: "sidebar.settingsActivity",      icon: Clock },
        { id: "settings-danger",        labelKey: "sidebar.settingsDanger",        icon: AlertTriangle },
        { id: "settings-sla",           labelKey: "sidebar.settingsSla",           icon: Target },
      ],
    },
  ];

  // Track which group is open — initialise expanded if already on a sub-page
  const [openGroup, setOpenGroup] = useState<NavItemId | null>(
    DATA_IMPORT_GROUP.includes(activeItem)
      ? "data-import"
      : REPORTS_GROUP.includes(activeItem)
        ? "reports"
        : SETTINGS_GROUP.includes(activeItem)
          ? "settings"
          : null,
  );

  const toggleGroup = (id: NavItemId) =>
    setOpenGroup((prev) => (prev === id ? null : id));

  const arrowRotated = isRtl !== collapsed;

  return (
    <aside
      className={[
        "flex flex-col bg-white border-e border-gray-200 h-full shrink-0 transition-all duration-300",
        collapsed ? "w-20" : "w-64",
      ].join(" ")}
    >
      {/* ── Collapse toggle ── */}
      <div className="flex w-full  px-4 py-10">
        <button
          onClick={toggleCollapsed}
          className="ml-auto text-gray-400 hover:text-gray-900 transition-colors p-2 rounded-xl hover:bg-gray-100 group relative"
        >
          {collapsed && (
            <div
              className={[
                "absolute top-1/2 -translate-y-1/2 invisible opacity-0 group-hover:visible group-hover:opacity-100 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 transition-all duration-200 w-max",
                isRtl ? "right-full mr-3" : "left-full ml-3",
              ].join(" ")}
            >
              {t("sidebar.expand")}
            </div>
          )}
          <ChevronsLeft
            size={18}
            className={`transition-transform duration-300 ${arrowRotated ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* ── Nav items ── */}
      <nav className="flex flex-col gap-1 px-3 mt-1 flex-1">
        {navItems.map((item) => {
          // ── Items with a submenu ──────────────────────────────────────
          if (item.subItems) {
            const Icon = item.icon;
            const isGroupActive =
              (item.id === "data-import" && DATA_IMPORT_GROUP.includes(activeItem)) ||
              (item.id === "reports" && REPORTS_GROUP.includes(activeItem)) ||
              (item.id === "settings" && SETTINGS_GROUP.includes(activeItem));

            return (
              <div key={item.id}>
                {/* Parent row */}
                <button
                  onClick={() => {
                    const isOpening = openGroup !== item.id;
                    toggleGroup(item.id);
                    if (isOpening) onNavigate?.(item.subItems![0].id);
                  }}
                  className={[
                    "flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold w-full group relative",
                    isGroupActive
                      ? "text-[#2E75B6] bg-blue-50"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                    collapsed ? "justify-center" : "",
                  ].join(" ")}
                >
                  {collapsed && (
                    <div
                      className={[
                        "absolute top-1/2 -translate-y-1/2 invisible opacity-0 group-hover:visible group-hover:opacity-100 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 transition-all duration-200 w-max",
                        isRtl ? "right-full mr-3" : "left-full ml-3",
                      ].join(" ")}
                    >
                      {t(item.labelKey)}
                    </div>
                  )}
                  <Icon size={20} className="shrink-0" />
                  {!collapsed && (
                    <span className="flex-1 text-start">{t(item.labelKey)}</span>
                  )}
                  {!collapsed && (
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${openGroup === item.id ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {/* Sub-items */}
                {openGroup === item.id && !collapsed && (
                  <div className="ms-4 mt-0.5 mb-1 flex flex-col gap-0.5 border-s-2 border-gray-100 ps-3">
                    {item.subItems.map((sub) => {
                      const SubIcon = sub.icon;
                      const isSubActive = sub.id === activeItem;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => onNavigate?.(sub.id)}
                          className={[
                            "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm w-full text-start transition-all duration-200",
                            isSubActive
                              ? "text-[#2E75B6] bg-blue-50 font-semibold"
                              : "text-gray-400 hover:text-gray-700 hover:bg-gray-50 font-medium",
                          ].join(" ")}
                        >
                          <SubIcon
                            size={15}
                            className={isSubActive ? "text-[#2E75B6]" : "text-gray-400"}
                          />
                          {t(sub.labelKey)}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // ── Regular item ──────────────────────────────────────────────
          const Icon = item.icon;
          const isActive = item.id === activeItem;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate?.(item.id)}
              className={[
                "flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold w-full group relative",
                isActive
                  ? "bg-[#2E75B6] text-white shadow-lg shadow-[rgba(46,117,182,0.30)]"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                collapsed ? "justify-center" : "",
              ].join(" ")}
            >
              {collapsed && (
                <div
                  className={[
                    "absolute top-1/2 -translate-y-1/2 invisible opacity-0 group-hover:visible group-hover:opacity-100 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 transition-all duration-200 w-max",
                    isRtl ? "right-full mr-3" : "left-full ml-3",
                  ].join(" ")}
                >
                  {t(item.labelKey)}
                </div>
              )}
              <Icon size={20} className="shrink-0" />
              {!collapsed && (
                <span className="flex-1 text-start">{t(item.labelKey)}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* ── Logout ── */}
      <div className="px-3 pb-5 pt-2 border-t border-gray-100">
        <button
          onClick={onLogout}
          className={[
            "flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold w-full text-red-400 hover:bg-red-50 hover:text-red-600 group relative",
            collapsed ? "justify-center" : "",
          ].join(" ")}
        >
          {collapsed && (
            <div
              className={[
                "absolute top-1/2 -translate-y-1/2 invisible opacity-0 group-hover:visible group-hover:opacity-100 px-2.5 py-1.5 bg-gray-900 text-white text-xs font-semibold rounded-lg shadow-xl whitespace-nowrap z-50 transition-all duration-200 w-max",
                isRtl ? "right-full mr-3" : "left-full ml-3",
              ].join(" ")}
            >
              {t("sidebar.logout")}
            </div>
          )}
          <LogOut size={20} className="shrink-0" />
          {!collapsed && (
            <span className="flex-1 text-start">{t("sidebar.logout")}</span>
          )}
        </button>
      </div>
    </aside>
  );
}
