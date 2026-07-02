import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './app/auth-context';
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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute allowedRoles={[ 'admin', 'dispatcher' ]} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/dispatch-board" element={<DispatchBoard />} />
            </Route>
          </Route>
          <Route element={<ProtectedRoute allowedRoles={[ 'worker' ]} />}>
            <Route element={<WorkerLayout />}>
              <Route path="/worker/dashboard" element={<WorkerDashboard />} />
              <Route path="/worker/tasks/:id" element={<TaskDetail />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}