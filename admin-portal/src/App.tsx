import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import DashboardPage from '@/features/dashboard/DashboardPage';
import SessionsPage from '@/features/sessions/SessionsPage';
import StorePage from '@/features/store/StorePage';
import UsersPage from '@/features/users/UsersPage';
import SuggestionsPage from '@/features/suggestions/SuggestionsPage';
import SettingsPage from '@/features/settings/SettingsPage';
import { LoginPage, ForgotPasswordPage } from '@/features/auth/AuthPages';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/suggestions" element={<SuggestionsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* 404 Redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
