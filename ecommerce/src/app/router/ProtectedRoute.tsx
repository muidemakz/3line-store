import { Navigate, Outlet, useLocation } from 'react-router-dom';

export function ProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem('auth_token');

  if (!token) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
}
