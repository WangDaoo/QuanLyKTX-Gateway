// Protected Route Component
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.vaiTro)) {
    // Redirect to appropriate dashboard based on role
    const roleRedirect: Record<string, string> = {
      Admin: '/admin',
      Officer: '/officer',
      Student: '/student',
    };
    const redirectPath = roleRedirect[user.vaiTro] || '/login';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}
