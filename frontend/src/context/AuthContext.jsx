/**
 * AuthContext.jsx
 * Cung cấp trạng thái xác thực (user, loading) và các hàm auth cho toàn app.
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // null = chưa đăng nhập
  const [loading, setLoading] = useState(true);   // true khi đang kiểm tra session

  // Kiểm tra session hiện tại khi load app (cookie tự gửi cùng request)
  useEffect(() => {
    authService
      .me()
      .then((data) => setUser(data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  /** Đăng nhập → cập nhật user state */
  const login = useCallback(async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  }, []);

  /** Đăng ký → cập nhật user state */
  const register = useCallback(async (username, email, password) => {
    const data = await authService.register(username, email, password);
    setUser(data.user);
    return data;
  }, []);

  /** Đăng xuất → xoá user state */
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook để dùng trong component */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải được dùng bên trong <AuthProvider>");
  return ctx;
}
