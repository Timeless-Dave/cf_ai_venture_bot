import { useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@cloudflare/kumo";
import {
  HouseIcon,
  ClockCounterClockwiseIcon,
  LayoutIcon,
  VideoCameraIcon,
  FileTextIcon,
  ShareNetworkIcon,
  ListIcon,
  XIcon
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
    <Button
      variant="ghost"
      onClick={onClick}
      className={`w-12 h-12 sm:w-14 sm:h-14 mb-2 flex flex-col items-center justify-center rounded-xl transition-all duration-200 group ${
        isActive
          ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
          : "text-kumo-subtle hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-slate-100"
      }`}
      aria-label={label}
    >
      <div
        className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? "scale-110" : ""}`}
      >
        {icon}
      </div>
    </Button>
  );
}

export function Sidebar({ onClearHistory, onGeneratePlan }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button - Top Left */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="ghost"
          shape="square"
          icon={isOpen ? <XIcon size={24} /> : <ListIcon size={24} />}
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          className="bg-white/80 dark:bg-kumo-elevated/80 backdrop-blur-md shadow-sm rounded-xl border border-slate-200 dark:border-white/5"
        />
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-20 sm:w-24 bg-white/95 dark:bg-[#1a1d24]/95 backdrop-blur-xl border-r border-slate-100 dark:border-white/5 shadow-[2px_0_15px_-3px_rgba(0,0,0,0.03)] dark:shadow-[2px_0_15px_-3px_rgba(0,0,0,0.2)] z-40 flex flex-col items-center py-6 sm:py-8 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Profile Avatar (Top) */}
        <div className="mb-10 sm:mb-12 cursor-pointer group relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-200 to-amber-400 flex items-center justify-center overflow-hidden border-2 border-white dark:border-[#1a1d24] shadow-sm transform transition-transform duration-300 group-hover:scale-105">
            <span className="text-orange-900 font-bold text-sm select-none">
              SV
            </span>
          </div>
          <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#1a1d24]"></div>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 flex flex-col items-center w-full relative z-10">
          <NavItem
            icon={<HouseIcon size={24} weight="duotone" />}
            label="Home"
            isActive={true}
            onClick={() => {
              if (window.innerWidth < 768) setIsOpen(false);
            }}
          />
          <NavItem
            icon={<ClockCounterClockwiseIcon size={24} weight="duotone" />}
            label="History"
            onClick={() => {
              onClearHistory();
              if (window.innerWidth < 768) setIsOpen(false);
            }}
          />
          <NavItem
            icon={<LayoutIcon size={24} weight="duotone" />}
            label="Dashboard"
          />
          <NavItem
            icon={<FileTextIcon size={24} weight="duotone" />}
            label="Generate Plan"
            onClick={() => {
              onGeneratePlan();
              if (window.innerWidth < 768) setIsOpen(false);
            }}
          />
          <NavItem
            icon={<VideoCameraIcon size={24} weight="duotone" />}
            label="Meetings"
          />
          <NavItem
            icon={<ShareNetworkIcon size={24} weight="duotone" />}
            label="Integrations"
          />
        </nav>

        {/* Bottom Logo or settings */}
        <div className="mt-auto pt-6 flex flex-col items-center">
          <div className="w-5 h-5 opacity-40 hover:opacity-100 transition-opacity cursor-pointer">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
          </div>
        </div>
      </aside>
    </>
  );
}
