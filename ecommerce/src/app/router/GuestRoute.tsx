import { Navigate, Outlet } from 'react-router-dom';

export function GuestRoute() {
  const token = localStorage.getItem('auth_token');
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
