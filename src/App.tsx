import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { UserRole } from './types';
import { ROUTES } from './config/constants';

import { HomePage } from './pages/public/HomePage';
import { SearchPage } from './pages/public/SearchPage';
import { ListingDetailPage } from './pages/public/ListingDetailPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

import { BuyerDashboard } from './pages/buyer/BuyerDashboard';

import { SellerDashboard } from './pages/seller/SellerDashboard';
import { CreateListingPage } from './pages/seller/CreateListingPage';

import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminListingsPage } from './pages/admin/AdminListingsPage';
import { AdminCatalogPage } from './pages/admin/AdminCatalogPage';

import { Loading } from './components/ui';

function App() {
  const { checkAuth, isLoading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.SEARCH} element={<SearchPage />} />
        <Route path={ROUTES.LISTING_DETAIL} element={<ListingDetailPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />

        <Route
          path={ROUTES.BUYER_DASHBOARD}
          element={
            <ProtectedRoute allowedRoles={[UserRole.BUYER]}>
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.BUYER_ORDERS}
          element={
            <ProtectedRoute allowedRoles={[UserRole.BUYER]}>
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.SELLER_DASHBOARD}
          element={
            <ProtectedRoute allowedRoles={[UserRole.SELLER]}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SELLER_LISTINGS}
          element={
            <ProtectedRoute allowedRoles={[UserRole.SELLER]}>
              <SellerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.SELLER_CREATE_LISTING}
          element={
            <ProtectedRoute allowedRoles={[UserRole.SELLER]}>
              <CreateListingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.ADMIN_DASHBOARD}
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_LISTINGS}
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminLayout>
                <AdminListingsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/catalog"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminLayout>
                <AdminCatalogPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
