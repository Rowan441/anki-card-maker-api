import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

interface AuthContextType {
  isAuthenticated: boolean;
  user: { type: "anonymous" | "google"; email?: string; name?: string } | null;
  login: (type: "anonymous" | "google", email?: string) => void;
  logout: () => Promise<void>;
  loading: boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ type: "anonymous" | "google"; email?: string; name?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status with backend
  const checkAuthStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/auth/status`, {
        credentials: 'include', // Important: send cookies
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser({
          type: data.user.provider === 'anonymous' ? 'anonymous' : 'google',
          email: data.user.email,
          name: data.user.name,
        });
      } else {
        // Not authenticated
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Check for existing auth on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = (type: "anonymous" | "google", email?: string, name?: string) => {
    setIsAuthenticated(true);
    setUser({ type, email, name });
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const refreshAuth = async () => {
    await checkAuthStatus();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, loading, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
