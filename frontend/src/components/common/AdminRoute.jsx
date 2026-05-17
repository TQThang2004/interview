/**
 * AdminRoute.jsx
 * Bao bọc các route chỉ dành cho admin.
 * Nếu chưa đăng nhập → redirect /login.
 * Nếu không phải admin → redirect /dashboard.
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../constants/routes';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div>Đang tải...</div>;
  if (!user) return <Navigate to={ROUTES.LOGIN} replace />;
  if (user.role !== 'admin') return <Navigate to={ROUTES.DASHBOARD} replace />;

  return children;
}
