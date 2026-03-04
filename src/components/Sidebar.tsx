import { useState } from "react";
import type { ReactNode } from "react";
import {
  HouseIcon,
  ClockCounterClockwiseIcon,
  LayoutIcon,
  VideoCameraIcon,
  FileTextIcon,
  ShareNetworkIcon,
  ListIcon,
  XIcon,
  TrashIcon
} from "@phosphor-icons/react";

interface SidebarProps {
  onClearHistory: () => void;
  onGeneratePlan: () => void;
}

interface NavItemProps {
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

function NavItem({ icon, label, isActive, onClick }: NavItemProps) {
  return (
    <div className="relative group/navitem w-full flex justify-center mb-1">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={[
          "w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer",
          "outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
          isActive
            ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
            : "text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
        ].join(" ")}
      >
        <span
          className={`block transition-transform duration-200 group-hover/navitem:scale-110 ${isActive ? "scale-110" : ""}`}
        >
          {icon}
        </span>
      </button>
      {/* Tooltip — appears to the right */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg opacity-0 group-hover/navitem:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-lg z-[9999]"
      >
        {label}
        <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800 dark:border-r-white" />
      </div>
    </div>
  );
}

export function Sidebar({ onClearHistory, onGeneratePlan }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePage, setActivePage] = useState("home");

  const nav = (page: string, action?: () => void) => {
    setActivePage(page);
    action?.();
    setMobileOpen(false);
  };

  return (
    <>
      {/* ── Mobile hamburger (always on top) ─────────────────────── */}
      <div className="md:hidden fixed top-3 left-3 z-[60]">
        <button
          type="button"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
          className="w-10 h-10 bg-white dark:bg-[#1a1d24] border border-slate-200 dark:border-white/10 shadow rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#252830] transition-colors"
        >
          {mobileOpen ? <XIcon size={20} /> : <ListIcon size={20} />}
        </button>
      </div>

      {/* ── Overlay (mobile only) ─────────────────────────────────── */}
      {mobileOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 bg-black/40 z-[50] md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar panel ─────────────────────────────────────────── */}
      <aside
        className={[
          // Size & positioning
          "fixed md:sticky top-0 left-0 w-[72px] h-screen shrink-0",
          // Visuals
          "bg-white dark:bg-[#1a1d24]",
          "border-r border-slate-100 dark:border-white/[0.06]",
          // Layout
          "flex flex-col items-center py-5",
          // Stacking
          "z-[55]",
          // Slide animation (mobile only; md always visible)
          "transition-transform duration-300 ease-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        ].join(" ")}
      >
        {/* Avatar */}
        <div className="mb-5 relative shrink-0 cursor-pointer group/av">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-300 to-amber-500 flex items-center justify-center border-2 border-white dark:border-[#1a1d24] shadow transition-transform duration-200 group-hover/av:scale-110">
            <span className="text-orange-950 font-bold text-[11px] select-none">
              SV
            </span>
          </div>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#1a1d24]" />
        </div>

        <div className="w-7 h-px bg-slate-100 dark:bg-white/5 mb-3 shrink-0" />

        {/* Nav */}
        <nav className="flex-1 flex flex-col items-center w-full overflow-visible">
          <NavItem
            icon={<HouseIcon size={21} weight="duotone" />}
            label="Home"
            isActive={activePage === "home"}
            onClick={() => nav("home")}
          />
          <NavItem
            icon={<ClockCounterClockwiseIcon size={21} weight="duotone" />}
            label="Clear History"
            isActive={activePage === "history"}
            onClick={() => nav("history", onClearHistory)}
          />
          <NavItem
            icon={<LayoutIcon size={21} weight="duotone" />}
            label="Dashboard"
            isActive={activePage === "dashboard"}
            onClick={() => nav("dashboard")}
          />
          <NavItem
            icon={<FileTextIcon size={21} weight="duotone" />}
            label="Generate Plan"
            isActive={activePage === "plan"}
            onClick={() => nav("plan", onGeneratePlan)}
          />
          <NavItem
            icon={<VideoCameraIcon size={21} weight="duotone" />}
            label="Meetings"
            isActive={activePage === "meetings"}
            onClick={() => nav("meetings")}
          />
          <NavItem
            icon={<ShareNetworkIcon size={21} weight="duotone" />}
            label="Integrations"
            isActive={activePage === "integrations"}
            onClick={() => nav("integrations")}
          />
        </nav>

        <div className="w-7 h-px bg-slate-100 dark:bg-white/5 mt-auto mb-3 shrink-0" />

        {/* Clear chat (bottom danger action) */}
        <div className="relative group/navitem w-full flex justify-center shrink-0">
          <button
            type="button"
            aria-label="Clear all chats"
            onClick={() => {
              onClearHistory();
              setMobileOpen(false);
            }}
            className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-300 dark:text-slate-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 transition-all duration-200 cursor-pointer"
          >
            <TrashIcon size={20} weight="duotone" />
          </button>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-800 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg opacity-0 group-hover/navitem:opacity-100 transition-opacity duration-150 whitespace-nowrap shadow-lg z-[9999]"
          >
            Clear Chats
            <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-800 dark:border-r-white" />
          </div>
        </div>
      </aside>
    </>
  );
}
