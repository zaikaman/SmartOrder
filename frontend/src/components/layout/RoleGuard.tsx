import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { UserRole } from '../../types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireAuth?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  requireAuth = true,
}) => {
  const { isAuthenticated, user } = useAuthStore();
  const location = useLocation();

  if (requireAuth && !isAuthenticated) {
    // Lưu lại đường dẫn để sau khi đăng nhập quay lại
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    if (!user || !allowedRoles.includes(user.role)) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
          <div className="max-w-md w-full bg-white p-6 rounded-xl shadow border border-stone-200 text-center">
            <h2 className="text-xl font-bold text-stone-900 mb-2">Truy cập bị từ chối</h2>
            <p className="text-stone-600 text-sm mb-4">
              Tài khoản của bạn không có quyền truy cập vào khu vực quản lý này.
            </p>
            <a
              href="/"
              className="inline-block px-4 py-2 bg-orange-700 text-white rounded-lg text-sm font-medium hover:bg-orange-800 transition"
            >
              Quay về Trang chủ
            </a>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
