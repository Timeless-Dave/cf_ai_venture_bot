import { useCallback, useState, useEffect } from "react";
import { Button } from "@cloudflare/kumo";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";

function getInitialTheme(): boolean {
  // Check localStorage first, then system preference
  const saved = localStorage.getItem("theme");
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function applyTheme(dark: boolean) {
  const mode = dark ? "dark" : "light";
  document.documentElement.setAttribute("data-mode", mode);
  document.documentElement.style.colorScheme = mode;
  // Tailwind dark mode uses the 'dark' class on <html>
  if (dark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  localStorage.setItem("theme", mode);
}

export function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() => {
    const isDark = getInitialTheme();
    // Apply theme immediately without waiting for render
    return isDark;
  });

  // Apply theme on mount and whenever dark changes
  useEffect(() => {
    applyTheme(dark);
  }, [dark]);

  const toggle = useCallback(() => {
    setDark((prev) => !prev);
  }, []);

  return (
    <Button
      variant="ghost"
      shape="square"
      icon={
        dark ? (
          <SunIcon size={18} weight="duotone" />
        ) : (
          <MoonIcon size={18} weight="duotone" />
        )
      }
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="w-9 h-9 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 transition-colors rounded-lg"
    />
  );
}
