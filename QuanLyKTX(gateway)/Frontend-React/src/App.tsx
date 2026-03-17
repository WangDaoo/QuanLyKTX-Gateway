import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

function RootRedirect() {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const role = user?.vaiTro;
  if (role === 'Student') return <Navigate to="/student" replace />;
  if (role === 'Officer') return <Navigate to="/officer" replace />;
  return <Navigate to="/admin" replace />;
}
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';
import Login from './pages/auth/Login';
import ChangePassword from './pages/auth/ChangePassword';
import AdminLayout from './components/layout/AdminLayout';
import StudentLayout from './components/layout/StudentLayout';
import OfficerLayout from './components/layout/OfficerLayout';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Buildings from './pages/admin/Buildings';
import Rooms from './pages/admin/Rooms';
import Beds from './pages/admin/Beds';
import Students from './pages/admin/Students';
import Contracts from './pages/admin/Contracts';
import Bills from './pages/admin/Bills';
import Receipts from './pages/admin/Receipts';
import Fees from './pages/admin/Fees';
import FeeConfigs from './pages/admin/FeeConfigs';
import PriceTiers from './pages/admin/PriceTiers';
import MeterReadings from './pages/admin/MeterReadings';
import Registrations from './pages/admin/Registrations';
import ChangeRequests from './pages/admin/ChangeRequests';
import Violations from './pages/admin/Violations';
import DisciplineScores from './pages/admin/DisciplineScores';
import OverdueNotices from './pages/admin/OverdueNotices';
import Reports from './pages/admin/Reports';
import Users from './pages/admin/Users';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import Profile from './pages/student/Profile';
import StudentRoom from './pages/student/Room';
import StudentContract from './pages/student/Contract';
import StudentBills from './pages/student/Bills';
import Payments from './pages/student/Payments';
import StudentFees from './pages/student/Fees';
import Services from './pages/student/Services';
import Requests from './pages/student/Requests';
import StudentDisciplineScores from './pages/student/DisciplineScores';
import StudentViolations from './pages/student/Violations';

// Officer Pages
import OfficerDashboard from './pages/officer/Dashboard';
import OfficerRegistrations from './pages/officer/Registrations';
import OfficerChangeRequests from './pages/officer/ChangeRequests';
import OfficerMeterReadings from './pages/officer/MeterReadings';
import OfficerViolations from './pages/officer/Violations';
import OfficerDisciplineScores from './pages/officer/DisciplineScores';
import OfficerReports from './pages/officer/Reports';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="buildings" element={<Buildings />} />
            <Route path="rooms" element={<Rooms />} />
            <Route path="beds" element={<Beds />} />
            <Route path="students" element={<Students />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="bills" element={<Bills />} />
            <Route path="receipts" element={<Receipts />} />
            <Route path="fees" element={<Fees />} />
            <Route path="fee-configs" element={<FeeConfigs />} />
            <Route path="price-tiers" element={<PriceTiers />} />
            <Route path="meter-readings" element={<MeterReadings />} />
            <Route path="registrations" element={<Registrations />} />
            <Route path="change-requests" element={<ChangeRequests />} />
            <Route path="violations" element={<Violations />} />
            <Route path="discipline-scores" element={<DisciplineScores />} />
            <Route path="overdue-notices" element={<OverdueNotices />} />
            <Route path="reports" element={<Reports />} />
            <Route path="users" element={<Users />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['Student']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="room" element={<StudentRoom />} />
            <Route path="contract" element={<StudentContract />} />
            <Route path="bills" element={<StudentBills />} />
            <Route path="payments" element={<Payments />} />
            <Route path="fees" element={<StudentFees />} />
            <Route path="services" element={<Services />} />
            <Route path="requests" element={<Requests />} />
            <Route path="discipline-scores" element={<StudentDisciplineScores />} />
            <Route path="violations" element={<StudentViolations />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>

          {/* Officer Routes */}
          <Route
            path="/officer"
            element={
              <ProtectedRoute allowedRoles={['Officer']}>
                <OfficerLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<OfficerDashboard />} />
            <Route path="registrations" element={<OfficerRegistrations />} />
            <Route path="change-requests" element={<OfficerChangeRequests />} />
            <Route path="meter-readings" element={<OfficerMeterReadings />} />
            <Route path="violations" element={<OfficerViolations />} />
            <Route path="discipline-scores" element={<OfficerDisciplineScores />} />
            <Route path="reports" element={<OfficerReports />} />
            <Route path="change-password" element={<ChangePassword />} />
          </Route>

          {/* Default redirect based on role */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
