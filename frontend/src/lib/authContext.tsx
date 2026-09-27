"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, AuthResponse } from "./types";
import { localStore } from "./storage";
import { api } from "./api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  loginDemo: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    async function loadAuth() {
      try {
        const stored = await localStore.initAuth();
        if (stored.token && stored.user) {
          setToken(stored.token);
          setUser(stored.user);
          // Verify with /me
          try {
            const fresh = await api.getMe();
            setUser(fresh);
            await localStore.saveAuth(stored.token, fresh);
          } catch (e: any) {
            if (e?.message?.includes("401") || e?.message?.includes("403")) {
              await localStore.clearAuth();
              setToken(null);
              setUser(null);
            }
          }
        }
      } catch (err) {
        console.warn("Auth initialization failed:", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res: AuthResponse = await api.login(email, password);
    setToken(res.token);
    setUser(res.user);
    setIsAuthModalOpen(false);
  };

  const register = async (email: string, password: string, name?: string) => {
    const res: AuthResponse = await api.register(email, password, name);
    setToken(res.token);
    setUser(res.user);
    setIsAuthModalOpen(false);
  };

  const loginDemo = async () => {
    await login("kshitiz23kumar@gmail.com", "muninn2026");
  };

  const logout = async () => {
    await api.logout();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
        login,
        register,
        loginDemo,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
