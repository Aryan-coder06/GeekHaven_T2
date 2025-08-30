import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import * as auth from "@/lib/auth"; // login, register, me, logout (cookie-based)
// see previous message for minimal implementation

// Toggle Demo mode with Vite env (optional)
// VITE_DEMO_MODE=true -> localStorage mock still works alongside backend
const DEMO_MODE = import.meta?.env?.VITE_DEMO_MODE === "true";

// ---------- Types ----------
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;  
  bio?: string;
  rating?: number;
  reviewCount?: number;
  joinedDate?: Date;
  role?: "buyer" | "seller" | "admin";
  verified?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  asSeller?: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

// ---------- Mock user for Demo ----------
const mockUser: User = {
  id: "user-123",
  name: "Alex Thompson",
  email: "alex@example.com",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  bio: "Passionate collector and reseller of vintage items. Specializing in electronics and vinyl records.",
  rating: 4.8,
  reviewCount: 127,
  joinedDate: new Date("2023-01-15"),
  role: "seller",
  verified: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------- Helpers ----------
const LOCAL_KEY = "marketplace-auth";

function normalizeUser(u: any): User {
  // Map your backend's shape to the UI shape safely
  // e.g., {_id, name, email, avatar, createdAt, role, verified}
  return {
    id: String(u?._id ?? u?.id ?? ""),
    name: u?.name ?? "",
    email: u?.email ?? "",
    avatar: u?.avatar ?? undefined,
    bio: u?.bio ?? undefined,
    rating: typeof u?.rating === "number" ? u.rating : undefined,
    reviewCount: typeof u?.reviewCount === "number" ? u.reviewCount : undefined,
    joinedDate: u?.joinedDate ? new Date(u.joinedDate) : (u?.createdAt ? new Date(u.createdAt) : undefined),
    role: u?.role as User["role"],
    verified: Boolean(u?.verified),
  };
}

// ---------- Provider ----------
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const setAuthed = (user: User | null) =>
    setState({
      user,
      isAuthenticated: Boolean(user),
      isLoading: false,
    });

  // Try backend first; fall back to demo/localStorage (if enabled)
  const refresh = async () => {
    try {
      const res = await auth.me();
      if (res?.success && (res.user || res.userData)) {
        const u = normalizeUser(res.user ?? res.userData);
        setAuthed(u);
        // Do NOT store cookie-auth in localStorage
        return;
      }
    } catch {
      // ignore; will fall back if DEMO_MODE
    }

    if (DEMO_MODE) {
      const saved = localStorage.getItem(LOCAL_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const u = normalizeUser(parsed.user);
          setAuthed(u);
          return;
        } catch {
          // ignore parse error
        }
      }
    }

    setAuthed(null);
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email: string, password: string) => {
    
    if (DEMO_MODE && email === "demo@example.com" && password === "demo") {
      const authData = { user: mockUser };
      localStorage.setItem(LOCAL_KEY, JSON.stringify(authData));
      setAuthed(mockUser);
      return;
    }

    // Real backend
    const res = await auth.login({ email, password });
    if (!res?.success) throw new Error(res?.message || "Login failed");
    await refresh();
  };

  const register = async (data: RegisterPayload) => {
    // Real backend only (sign-up should hit API)
    const res = await auth.register(data);
    if (!res?.success) throw new Error(res?.message || "Signup failed");
    await refresh();
  };

  const logout = async () => {
    try {
      await auth.logout();
    } catch {
      // ignore (e.g., if not logged in on server)
    }
    if (DEMO_MODE) {
      localStorage.removeItem(LOCAL_KEY);
    }
    setAuthed(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    setState(prev => {
      if (!prev.user) return prev;
      const updated = { ...prev.user, ...updates };
      if (DEMO_MODE) {
        localStorage.setItem(LOCAL_KEY, JSON.stringify({ user: updated }));
      }
      return { ...prev, user: updated };
    });
  };

  const value = useMemo<AuthContextType>(
    () => ({
      ...state,
      login,
      register,
      logout,
      refresh,
      updateProfile,
    }),
    [state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------- Hook ----------
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
