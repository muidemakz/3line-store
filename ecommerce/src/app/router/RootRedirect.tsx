import { Navigate } from 'react-router-dom';

export function RootRedirect() {
  const token = localStorage.getItem('auth_token');
  return <Navigate to={token ? '/dashboard' : '/sign-in'} replace />;
}
