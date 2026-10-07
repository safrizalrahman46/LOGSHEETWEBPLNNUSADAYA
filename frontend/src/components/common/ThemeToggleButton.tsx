"use client";

import { useTheme } from "@/context/ThemeContext";
import React from "react";
import { Sun, Moon } from "lucide-react";

export const ThemeToggleButton: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle Theme"
      title={theme === "light" ? "Beralih ke Dark Mode" : "Beralih ke Light Mode"}
      className={`relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5 text-amber-400 transition-transform hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 text-gray-600 transition-transform hover:-rotate-12" />
      )}
    </button>
  );
};
