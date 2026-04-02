import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface User {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  rank: string;
}

type AuthResult = { error?: string; needsVerification?: boolean; email?: string };

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthResult>;
  register: (name: string, email: string, password: string) => Promise<AuthResult>;
  verify: (email: string, code: string) => Promise<AuthResult>;
  resendCode: (email: string) => Promise<AuthResult>;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

async function api(path: string, body?: object) {
  const res = await fetch(`${API}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: { 'Content-Type': 'application/json' },
    ...(body && { body: JSON.stringify(body) }),
  });
  return { ok: res.ok, data: await res.json() };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const setSession = (data: { user: User; token: string }) => {
    localStorage.setItem('token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const clearSession = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (!token) { setLoading(false); return; }

    fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(setUser)
      .catch(clearSession)
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email: string, password: string): Promise<AuthResult> => {
    const { ok, data } = await api('/auth/login', { email, password });
    if (!ok) return { error: data.error, needsVerification: data.needsVerification, email: data.email };
    setSession(data);
    return {};
  };

  const register = async (name: string, email: string, password: string): Promise<AuthResult> => {
    const { ok, data } = await api('/auth/register', { name, email, password });
    if (!ok) return { error: data.error };
    return { email: data.email };
  };

  const verify = async (email: string, code: string): Promise<AuthResult> => {
    const { ok, data } = await api('/auth/verify', { email, code });
    if (!ok) return { error: data.error };
    setSession(data);
    return {};
  };

  const resendCode = async (email: string): Promise<AuthResult> => {
    const { ok, data } = await api('/auth/send-code', { email });
    if (!ok) return { error: data.error };
    return {};
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, verify, resendCode, logout: clearSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
