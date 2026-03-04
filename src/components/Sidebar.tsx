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
  tooltip?: string;
}

function NavItem({ icon, label, isActive, onClick }: NavItemProps) {
  return (
    <div className="relative group/nav w-full flex justify-center mb-1">
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
          isActive
            ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 shadow-sm"
            : "text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
        }`}
      >
        <div
          className={`transition-transform duration-200 group-hover/nav:scale-110 ${isActive ? "scale-110" : ""}`}
        >
          {icon}
        </div>
      </button>
      {/* Tooltip */}
      <div className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold px-2.5 py-1.5 rounded-lg opacity-0 group-hover/nav:opacity-100 whitespace-nowrap transition-opacity duration-150 shadow-md z-[60]">
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-100" />
      </div>
    </div>
  );
}

export function Sidebar({ onClearHistory, onGeneratePlan }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activePage, setActivePage] = useState("home");

  const handleNav = (page: string, action?: () => void) => {
    setActivePage(page);
    action?.();
    if (window.innerWidth < 768) setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="w-10 h-10 bg-white/90 dark:bg-[#1a1d24]/90 backdrop-blur-md shadow-sm rounded-xl border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1a1d24] transition-colors"
        >
          {isOpen ? <XIcon size={20} /> : <ListIcon size={20} />}
        </button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen w-[72px] shrink-0
          bg-white dark:bg-[#1a1d24]
          border-r border-slate-100 dark:border-white/[0.06]
          z-40 flex flex-col items-center py-5 gap-0
          transition-transform duration-300 ease-out
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* User Avatar */}
        <div className="mb-6 cursor-pointer group/avatar relative shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-300 to-amber-500 flex items-center justify-center border-2 border-white dark:border-[#1a1d24] shadow-sm transition-transform duration-200 group-hover/avatar:scale-110">
            <span className="text-orange-950 font-bold text-xs select-none">
              SV
            </span>
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#1a1d24]" />
        </div>

        {/* Divider */}
        <div className="w-8 h-px bg-slate-100 dark:bg-white/5 mb-4 shrink-0" />

        {/* Navigation */}
        <nav className="flex-1 flex flex-col items-center w-full overflow-hidden">
          <NavItem
            icon={<HouseIcon size={22} weight="duotone" />}
            label="Home"
            isActive={activePage === "home"}
            onClick={() => handleNav("home")}
          />
          <NavItem
            icon={<ClockCounterClockwiseIcon size={22} weight="duotone" />}
            label="Clear History"
            isActive={activePage === "history"}
            onClick={() => handleNav("history", onClearHistory)}
          />
          <NavItem
            icon={<LayoutIcon size={22} weight="duotone" />}
            label="Dashboard"
            isActive={activePage === "dashboard"}
            onClick={() => handleNav("dashboard")}
          />
          <NavItem
            icon={<FileTextIcon size={22} weight="duotone" />}
            label="Generate Plan"
            isActive={activePage === "plan"}
            onClick={() => handleNav("plan", onGeneratePlan)}
          />
          <NavItem
            icon={<VideoCameraIcon size={22} weight="duotone" />}
            label="Meetings"
            isActive={activePage === "meetings"}
            onClick={() => handleNav("meetings")}
          />
          <NavItem
            icon={<ShareNetworkIcon size={22} weight="duotone" />}
            label="Integrations"
            isActive={activePage === "integrations"}
            onClick={() => handleNav("integrations")}
          />
        </nav>

        {/* Divider */}
        <div className="w-8 h-px bg-slate-100 dark:bg-white/5 mt-auto mb-3 shrink-0" />

        {/* Bottom: Clear History (danger) */}
        <div className="relative group/nav flex justify-center w-full shrink-0">
          <button
            type="button"
            onClick={() => {
              onClearHistory();
              if (window.innerWidth < 768) setIsOpen(false);
            }}
            aria-label="Delete all messages"
            className="w-11 h-11 flex items-center justify-center rounded-xl text-slate-300 dark:text-slate-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-400 transition-all duration-200 cursor-pointer"
          >
            <TrashIcon size={20} weight="duotone" />
          </button>
          <div className="pointer-events-none absolute left-[calc(100%+8px)] top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold px-2.5 py-1.5 rounded-lg opacity-0 group-hover/nav:opacity-100 whitespace-nowrap transition-opacity duration-150 shadow-md z-[60]">
            Clear Chat
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-100" />
          </div>
        </div>
      </aside>
    </>
  );
}
