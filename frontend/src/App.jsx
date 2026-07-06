import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './app/auth-context';
import { ThemeProvider } from './app/theme-context';
import ProtectedRoute from './common/components/ProtectedRoute';
import AdminLayout from './common/layouts/AdminLayout';
import WorkerLayout from './common/layouts/WorkerLayout';
import Home from './pages/Home';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import AdminDashboard from './pages/admin/AdminDashboard';
import WorkerDashboard from './pages/worker/WorkerDashboard';
import DispatchBoard from './pages/admin/DispatchBoard';
import TaskDetail from './pages/worker/TaskDetail';

import UserManagement from './pages/admin/UserManagement';
import Settings from './pages/Settings';
import MyAvailability from './pages/worker/MyAvailability';
import AvailabilityManagement from './pages/admin/AvailabilityManagement';
import AttendanceDashboard from './pages/admin/AttendanceDashboard';
import CheckIn from './pages/worker/CheckIn';

import ForgotPassword from './features/auth/ForgotPassword';
import ResetPassword from './features/auth/ResetPassword';
import SocketTest from './pages/dev/SocketTest';
import LiveTrackingDashboard from './pages/admin/LiveTrackingDashboard';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dev/socket-test" element={<SocketTest />} />
          <Route element={<ProtectedRoute allowedRoles={[ 'admin', 'dispatcher' ]} />}>
            <Route element={<AdminLayout />}>
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
              </Route>
              <Route path="/admin/dispatch-board" element={<DispatchBoard />} />
              <Route path="/admin/availability" element={<AvailabilityManagement />} />
              <Route path="/admin/attendance" element={<AttendanceDashboard />} />
              <Route path="/admin/tracking" element={<LiveTrackingDashboard />} />
              <Route path="/admin/settings" element={<Settings />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute allowedRoles={[ 'worker' ]} />}>
            <Route element={<WorkerLayout />}>
              <Route path="/worker/dashboard" element={<WorkerDashboard />} />
              <Route path="/worker/tasks/:id" element={<TaskDetail />} />
              <Route path="/worker/check-in" element={<CheckIn />} />
              <Route path="/worker/my-availability" element={<MyAvailability />} />
              <Route path="/worker/settings" element={<Settings />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: {
          background: '#1e293b',
          color: '#f8fafc',
          border: '1px solid #334155',
        }
      }} />
      </AuthProvider>
    </ThemeProvider>
  );
}