"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("pln_theme") as "light" | "dark" | null;
    if (saved === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("pln_theme", nextTheme);

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  if (!mounted) {
    return (
      <button
        type="button"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 text-xs font-semibold ${className}`}
      >
        <Sun className="w-4 h-4 text-amber-500" />
        <span>Light Mode</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === "light" ? "Beralih ke Dark Mode" : "Beralih ke Light Mode"}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all text-xs font-semibold select-none ${
        theme === "dark"
          ? "border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-300 shadow-xs"
      } ${className}`}
    >
      {theme === "light" ? (
        <>
          <Sun className="w-4 h-4 text-amber-500 transition-transform hover:rotate-45" />
          <span className="hidden sm:inline">Light Mode</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-indigo-400 transition-transform hover:-rotate-12" />
          <span className="hidden sm:inline">Dark Mode</span>
        </>
      )}
    </button>
  );
}
