import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../app/auth-context';

function getDefaultDashboard(role) {
  return role === 'worker' ? '/worker/dashboard' : '/admin/dashboard';
}

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-300">
        Loading session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to={getDefaultDashboard(user?.role)} replace />;
  }

  return <Outlet />;
}