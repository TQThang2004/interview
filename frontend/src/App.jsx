import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute    from './components/common/AdminRoute';
import { ROUTES }   from './constants/routes';

import LandingPage        from './pages/LandingPage';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import InterviewPage      from './pages/InterviewPage';
import DashboardPage      from './pages/DashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path={ROUTES.HOME}            element={<LandingPage />} />
            <Route path={ROUTES.LOGIN}           element={<LoginPage />} />
            <Route path={ROUTES.REGISTER}        element={<RegisterPage />} />
            <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />

            {/* Protected – cần đăng nhập */}
            <Route path={ROUTES.DASHBOARD} element={
              <ProtectedRoute><DashboardPage /></ProtectedRoute>
            } />
            <Route path={ROUTES.INTERVIEW} element={
              <ProtectedRoute><InterviewPage /></ProtectedRoute>
            } />

            {/* Admin Protected */}
            <Route path="/admin/*" element={
              <AdminRoute><AdminDashboardPage /></AdminRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
