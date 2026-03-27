import { Navigate, Route, Routes } from 'react-router-dom';
import { SignInPage } from '@/features/auth';
import { ProductsPage } from '@/features/products';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/sign-in" replace />} />
      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/products" element={<ProductsPage />} />
    </Routes>
  );
}
