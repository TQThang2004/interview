/**
 * ProtectedRoute.jsx
 * Bao bọc các route yêu cầu đăng nhập.
 * Nếu chưa đăng nhập → redirect /login.
 * Trong khi kiểm tra session → hiển thị màn hình loading.
 */
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "oklch(13% 0.018 250)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <svg
            className="animate-spin"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            style={{ margin: "0 auto 16px" }}
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="oklch(83.3% 0.145 321.434)"
              strokeWidth="3"
              strokeDasharray="30 70"
            />
          </svg>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
            Đang kiểm tra phiên đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
