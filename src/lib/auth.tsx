import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, tokenStorage } from "./api";

interface User {
  email: string;
  name?: string;
  role: string;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function decodeJwt(token: string): User | null {
  try {
    const payload = token.split(".")[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return {
      email: decoded.email || decoded.sub || "user@app.com",
      name: decoded.name,
      role: decoded.role ?? "user",
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = tokenStorage.get();
    if (t) {
      setToken(t);
      setUser(decodeJwt(t));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const token = res.access_token;

    if (!token) {
      console.error("No access_token received from backend", res);
      return;
    }

    tokenStorage.set(token);
    setToken(token);

    // Decode role from JWT; merge with res.user for email/name
    const decoded = decodeJwt(token);
    const baseUser = res.user ?? { email };
    setUser({
      email: baseUser.email,
      name: (baseUser as { name?: string }).name,
      role: decoded?.role ?? "user",
    });
  };

  const logout = () => {
    tokenStorage.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
