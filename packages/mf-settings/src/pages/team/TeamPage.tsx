import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { UserPlus, X } from "lucide-react";
import Breadcrumb from "../../shared/Breadcrumb";
import "../../lib/i18n";
import "../../index.css";
import {
  type Role,
  type TeamMember,
  type CreateUserPayload,
  type EditUserPayload,
  getUsers,
  getRoles,
  createUser,
  editUser,
  deactivateUser,
  activateUser,
} from "./team.service";

const ROLE_STYLES: Record<string, string> = {
  Admin:      "bg-green-100 text-green-700 border border-green-200",
  SuperAdmin: "bg-purple-100 text-purple-700 border border-purple-200",
  Operator:   "bg-orange-100 text-orange-700 border border-orange-200",
  Viewer:     "bg-gray-100 text-gray-600 border border-gray-200",
  Courier:    "bg-blue-100 text-blue-700 border border-blue-200",
  Manager:    "bg-teal-100 text-teal-700 border border-teal-200",
  Supervisor: "bg-indigo-100 text-indigo-700 border border-indigo-200",
};

const AVATAR_COLORS = [
  "bg-purple-100 text-purple-700",
  "bg-blue-100 text-blue-700",
  "bg-orange-100 text-orange-700",
  "bg-green-100 text-green-700",
  "bg-pink-100 text-pink-700",
];

function getAvatarColor(index: number) {
  return AVATAR_COLORS[index % AVATAR_COLORS.length];
}

function getInitial(member: TeamMember) {
  return (member.firstName?.[0] ?? member.email[0]).toUpperCase();
}

// ── Invite / Edit modal ──────────────────────────────────────────────────────

interface MemberModalProps {
  mode: "invite" | "edit";
  member?: TeamMember;
  roles: Role[];
  onClose: () => void;
  onSave: (data: CreateUserPayload | EditUserPayload, id?: string) => Promise<void>;
}

function MemberModal({ mode, member, roles, onClose, onSave }: MemberModalProps) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [email, setEmail]               = useState(member?.email ?? "");
  const [password, setPassword]         = useState("");
  const [selectedRoleId, setSelectedRoleId] = useState(member?.roleId ?? "");
  const [loading, setLoading]           = useState(false);
  const [error, setError]               = useState<string | null>(null);

  const selectableRoles = roles.filter(r => r.nameEn !== "SuperAdmin" && r.isActive);

  useEffect(() => {
    if (!selectedRoleId && selectableRoles.length > 0) {
      setSelectedRoleId(selectableRoles[0].id);
    }
  }, [selectableRoles.length]);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "invite") {
        await onSave({ email, password, roleId: selectedRoleId } as CreateUserPayload);
      } else {
        await onSave({ roleId: selectedRoleId } as EditUserPayload, member?.id);
      }
      onClose();
    } catch (err: any) {
      const title = err?.response?.data?.title;
      setError(title ?? t("team.errorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-0 sm:px-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl p-4 sm:p-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-bold text-gray-800">
            {mode === "invite" ? t("team.invite") : t("team.edit")}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email — invite only (edit only supports role change) */}
          {mode === "invite" && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t("settings.email")}</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#2E75B6] transition-colors"
              />
            </div>
          )}

          {/* Password — invite only */}
          {mode === "invite" && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">{t("team.password")}</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#2E75B6] transition-colors"
              />
            </div>
          )}

          {/* Role picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">{t("team.roleLabel")}</label>
            <div className="flex flex-col gap-1.5">
              {selectableRoles.map(r => {
                const name = isRtl ? r.nameAr : r.nameEn;
                const desc = isRtl ? r.descriptionAr : r.descriptionEn;
                const selected = selectedRoleId === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedRoleId(r.id)}
                    className={[
                      "flex items-start gap-3 px-3 py-2.5 rounded-xl border text-start transition-colors",
                      selected
                        ? "border-[#2E75B6] bg-[#2E75B6]/5"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <span className={[
                      "mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                      selected ? "border-[#2E75B6]" : "border-gray-300",
                    ].join(" ")}>
                      {selected && <span className="w-2 h-2 rounded-full bg-[#2E75B6]" />}
                    </span>
                    <span className="flex flex-col min-w-0">
                      <span className={["text-sm font-semibold", selected ? "text-[#2E75B6]" : "text-gray-800"].join(" ")}>
                        {name}
                      </span>
                      {desc && (
                        <span className="text-xs text-gray-400 leading-snug">{desc}</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          {/* Actions */}
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-semibold text-gray-500 hover:text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {t("settings.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading || !selectedRoleId}
              className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold bg-[#2E75B6] text-white rounded-xl hover:bg-[#245E91] transition-colors disabled:opacity-60"
            >
              {loading ? t("team.saving") : t("settings.saveChanges")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export default function TeamPage() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === "ar";

  const [members, setMembers]       = useState<TeamMember[]>([]);
  const [roles, setRoles]           = useState<Role[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [modal, setModal]           = useState<"invite" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<TeamMember | undefined>();

  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const [usersRes, rolesRes] = await Promise.all([getUsers(), getRoles()]);
      setMembers(usersRes.data);
      setRoles(rolesRes.data);
    } catch {
      setError(t("team.errorLoad"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  async function handleSave(payload: CreateUserPayload | EditUserPayload, id?: string) {
    if (id) {
      await editUser(id, payload as EditUserPayload);
    } else {
      await createUser(payload as CreateUserPayload);
    }
    await fetchData();
  }

  async function handleDeactivate(id: string) {
    await deactivateUser(id);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, isActive: false } : m));
  }

  async function handleActivate(id: string) {
    await activateUser(id);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, isActive: true } : m));
  }

  const activeMembers = members.filter(m => m.isActive);

  return (
    <div className="p-4 md:p-6 mx-auto" dir={isRtl ? "rtl" : "ltr"}>
      {/* ── Breadcrumb ── */}
      <div className="mb-5 md:mb-6">
        <Breadcrumb pageTitleKey="team.pageTitle" />
      </div>

      {/* ── Page title ── */}
      <div className="mb-5 md:mb-6">
        <h1 className="text-lg md:text-xl font-bold text-gray-800">{t("team.heading")}</h1>
        <p className="text-sm text-gray-400 mt-0.5">{t("team.subheading")}</p>
      </div>

      {/* ── Members card ── */}
      <div className="bg-white rounded-2xl shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] overflow-hidden">

        {/* Card header */}
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100 gap-3">
          <h2 className="text-sm md:text-base font-bold text-zinc-900 font-['Cairo'] truncate">
            {t("team.membersCount", { count: activeMembers.length })}
          </h2>
          <button
            onClick={() => { setEditTarget(undefined); setModal("invite"); }}
            className="flex items-center gap-2 px-3 md:px-4 py-2 text-xs md:text-sm font-semibold bg-[#2E75B6] text-white rounded-xl hover:bg-[#245E91] transition-colors shadow-sm shrink-0"
          >
            <UserPlus size={14} />
            <span>{t("team.invite")}</span>
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">{t("team.loading")}</div>
        ) : error ? (
          <div className="px-6 py-10 text-center text-sm text-red-500">{error}</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {members.map((member, index) => (
              <div
                key={member.id}
                className={[
                  "flex items-start md:items-center gap-3 px-4 md:px-6 py-4 transition-colors",
                  member.isActive ? "hover:bg-gray-50/60" : "opacity-60 bg-gray-50/40",
                ].join(" ")}
              >
                {/* Avatar */}
                <div className={["w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 mt-0.5 md:mt-0", getAvatarColor(index)].join(" ")}>
                  {getInitial(member)}
                </div>

                {/* Info — takes all free space */}
                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                  {/* Name + inactive badge */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-sm font-semibold text-gray-800 font-['Cairo'] truncate">
                      {member.firstName} {member.lastName}
                    </span>
                    {!member.isActive && (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-gray-100 text-gray-500 border border-gray-200 shrink-0">
                        {t("team.inactive")}
                      </span>
                    )}
                  </div>

                  {/* Email */}
                  <span className="text-xs text-gray-400 truncate">{member.email}</span>

                  {/* Role badge — mobile only */}
                  <span className={[
                    "md:hidden mt-1 w-fit px-2.5 py-0.5 text-[11px] font-semibold rounded-full font-['Cairo']",
                    ROLE_STYLES[member.roleName] ?? "bg-gray-100 text-gray-600 border border-gray-200",
                  ].join(" ")}>
                    {t(`team.roles.${member.roleName}`, member.roleName)}
                  </span>
                </div>

                {/* Role badge — desktop only */}
                <span className={[
                  "hidden md:inline-flex px-3 py-1 text-xs font-semibold rounded-full font-['Cairo'] shrink-0",
                  ROLE_STYLES[member.roleName] ?? "bg-gray-100 text-gray-600 border border-gray-200",
                ].join(" ")}>
                  {t(`team.roles.${member.roleName}`, member.roleName)}
                </span>

                {/* Actions — hidden for SuperAdmin (backend rejects these too) */}
                {member.roleName !== "SuperAdmin" && (
                  <div className="flex items-center gap-1.5 shrink-0 self-center">
                    {member.isActive && (
                      <>
                        <button
                          onClick={() => { setEditTarget(member); setModal("edit"); }}
                          className="px-2.5 md:px-3.5 py-1.5 text-xs font-semibold rounded-full border border-[#2E75B6] text-[#2E75B6] hover:bg-blue-50 transition-colors"
                        >
                          {t("team.edit")}
                        </button>
                        <button
                          onClick={() => handleDeactivate(member.id)}
                          className="px-2.5 md:px-3.5 py-1.5 text-xs font-semibold rounded-full border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                        >
                          {t("team.remove")}
                        </button>
                      </>
                    )}
                    {!member.isActive && (
                      <button
                        onClick={() => handleActivate(member.id)}
                        className="px-2.5 md:px-3.5 py-1.5 text-xs font-semibold rounded-full border border-green-200 text-green-600 hover:bg-green-50 transition-colors"
                      >
                        {t("team.reactivate")}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modal ── */}
      {modal && (
        <MemberModal
          mode={modal}
          member={editTarget}
          roles={roles}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
