"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

type ThemeContextType = {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme] = useState<ThemeMode>("light");

  useEffect(() => {
    try {
      localStorage.removeItem("pln_theme");
      document.documentElement.classList.remove("dark");
    } catch (_) {}
  }, []);

  const setTheme = () => {
    try {
      localStorage.removeItem("pln_theme");
      document.documentElement.classList.remove("dark");
    } catch (_) {}
  };

  const toggleTheme = () => {
    try {
      localStorage.removeItem("pln_theme");
      document.documentElement.classList.remove("dark");
    } catch (_) {}
  };

  return (
    <ThemeContext.Provider value={{ theme: "light", toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
