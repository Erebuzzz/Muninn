"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "nyx" | "helios";
export type TransitionPhase = "sunrise" | "sunset" | null;

interface ThemeContextType {
  theme: ThemeMode;
  transitionPhase: TransitionPhase;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "nyx",
  transitionPhase: null,
  setTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>("nyx");
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>(null);
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
    if (transitionPhase) return; // Prevent double trigger
    const next = theme === "nyx" ? "helios" : "nyx";
    const phase: TransitionPhase = next === "helios" ? "sunrise" : "sunset";

    setTransitionPhase(phase);

    // Coordinate DOM class swap right at the peak celestial horizon crest (320ms)
    setTimeout(() => {
      setThemeState(next);
      localStorage.setItem("muninn_theme", next);
      applyTheme(next);
    }, 320);

    // End transition phase once atmosphere clears
    setTimeout(() => {
      setTransitionPhase(null);
    }, 980);
  };

  return (
    <ThemeContext.Provider value={{ theme, transitionPhase, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
