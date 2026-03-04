import { useCallback, useState } from "react";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";

function getInitialDark(): boolean {
  try {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

function applyTheme(dark: boolean) {
  const mode = dark ? "dark" : "light";
  document.documentElement.setAttribute("data-mode", mode);
  document.documentElement.style.colorScheme = mode;
  localStorage.setItem("theme", mode);
}

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    const isDark = getInitialDark();
    // Sync the DOM immediately on mount
    applyTheme(isDark);
    return isDark;
  });

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer"
    >
      {dark ? (
        <SunIcon size={18} weight="duotone" className="text-amber-500" />
      ) : (
        <MoonIcon size={18} weight="duotone" className="text-slate-500" />
      )}
    </button>
  );
}
