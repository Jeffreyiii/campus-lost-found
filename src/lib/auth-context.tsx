'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';

/** 当前登录用户信息 */
interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  role: 'user' | 'admin';
}

/** 认证上下文值 */
interface AuthContextValue {
  user: UserInfo | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: UserInfo) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  token: null,
  loading: true,
  login: () => {},
  logout: () => {},
  isAdmin: false,
});

/**
 * 从 localStorage 恢复登录状态
 */
function loadAuthFromStorage(): { user: UserInfo | null; token: string | null } {
  if (typeof window === 'undefined') {
    return { user: null, token: null };
  }
  try {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      const user = JSON.parse(userStr) as UserInfo;
      return { user, token };
    }
  } catch {
    // 数据损坏，清除
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  return { user: null, token: null };
}

/**
 * 认证状态提供者
 * 在应用顶层包裹，为所有子组件提供登录/登出能力
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化时从 localStorage 恢复登录状态
  useEffect(() => {
    const stored = loadAuthFromStorage();
    setUser(stored.user);
    setToken(stored.token);
    setLoading(false);
  }, []);

  const login = useCallback((newToken: string, newUser: UserInfo) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

/** 获取当前认证状态 */
export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
