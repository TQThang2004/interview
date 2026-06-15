/**
 * authService.js
 * Gọi API xác thực backend. Token được quản lý qua HttpOnly cookie (server-side).
 */

import { AUTH_BASE_URL } from '../constants/api';
const AUTH_BASE = AUTH_BASE_URL;

/**
 * Helper gọi fetch với credentials (để gửi/nhận cookie).
 */
async function authFetch(path, options = {}) {
  const res = await fetch(`${AUTH_BASE}${path}`, {
    ...options,
    credentials: "include",                    // Quan trọng: gửi cookie cùng request
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.detail || "Đã xảy ra lỗi, vui lòng thử lại.");
  }
  return data;
}

export const authService = {
  /** Đăng ký tài khoản mới */
  register: (username, email, password) =>
    authFetch("/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    }),

  /** Đăng nhập, nhận cookie HttpOnly */
  login: (email, password) =>
    authFetch("/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  /**
   * Đăng nhập / đăng ký qua Google.
   * @param {string} credential – id_token trả về từ @react-oauth/google
   */
  loginWithGoogle: (credential) =>
    authFetch("/google/callback", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),

  /** Đăng xuất, server xoá cookie */
  logout: () =>
    authFetch("/logout", { method: "POST" }),

  /** Lấy thông tin user hiện tại từ cookie */
  me: () =>
    authFetch("/me", { method: "GET" }),

  forgotPassword: (email) =>
    authFetch("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token, newPassword) =>
    authFetch("/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, new_password: newPassword }),
    }),
};
