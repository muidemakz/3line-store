import { Navigate, Route, Routes } from 'react-router-dom';
import { GuestRoute } from '@/app/router/GuestRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/app/router/ProtectedRoute';
import { RootRedirect } from '@/app/router/RootRedirect';
import { SignInPage } from '@/features/auth/pages/SignInPage';
import { CartPage } from '@/features/cart';
import { CheckoutPage } from '@/features/checkout';
import { DashboardPage } from '@/features/dashboard';
import { OrdersPage } from '@/features/orders';
import { ProfilePage } from '@/features/profile';
import { StorePage } from '@/features/store';
import { SuggestionsPage } from '@/features/suggestions';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<GuestRoute />}>
        <Route path="/sign-in" element={<SignInPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/store" element={<StorePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/suggestions" element={<SuggestionsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
