import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout/MainLayout';
import DashboardPage from '@/features/dashboard/DashboardPage';
import SessionsPage from '@/features/sessions/SessionsPage';
import StorePage from '@/features/store/StorePage';
import UsersPage from '@/features/users/UsersPage';
import SuggestionsPage from '@/features/suggestions/SuggestionsPage';
import SettingsPage from '@/features/settings/SettingsPage';
import ProfilePage from '@/features/profile/ProfilePage';
import SessionDetailsPage from '@/features/sessions/SessionDetailsPage';
import OrderDetailsPage from '@/features/orders/OrderDetailsPage';
import { LoginPage, ForgotPasswordPage } from '@/features/auth/AuthPages';

function App() {
  return (
    <Routes>
      {/* Standalone auth routes — no layout wrapper */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Protected routes inside MainLayout */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/sessions" element={<SessionsPage />} />
        <Route path="/sessions/:id" element={<SessionDetailsPage />} />
        <Route path="/orders/:id" element={<OrderDetailsPage />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/suggestions" element={<SuggestionsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* 404 → login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
