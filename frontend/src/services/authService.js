/**
 * authService.js
 * Gọi API xác thực backend. Token được quản lý qua HttpOnly cookie (server-side).
 */

const AUTH_BASE = "http://localhost:8000/api/auth";

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
};
