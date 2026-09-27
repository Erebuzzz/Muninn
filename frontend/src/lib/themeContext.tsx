"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "nyx" | "helios";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "nyx",
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>("nyx");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("muninn_theme") as ThemeMode | null;
    if (saved === "nyx" || saved === "helios") {
      setThemeState(saved);
      applyTheme(saved);
    } else {
      applyTheme("nyx");
    }
  }, []);

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    root.classList.remove("nyx", "helios");
    root.classList.add(mode);
    if (mode === "nyx") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  };

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem("muninn_theme", mode);
    applyTheme(mode);
  };

  const toggleTheme = () => {
    const next = theme === "nyx" ? "helios" : "nyx";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
