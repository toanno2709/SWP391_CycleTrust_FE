import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { UserRole } from './types';
import { ROUTES } from './config/constants';
import { signalRService } from './services/signalr';
import { ChatBubble } from './components/chat/ChatBubble';

import { HomePage } from './pages/public/HomePage';
import { SearchPage } from './pages/public/SearchPage';
import { ListingDetailPage } from './pages/public/ListingDetailPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

import { BuyerDashboard } from './pages/buyer/BuyerDashboard';
import BuyerOrdersPage from './pages/buyer/BuyerOrdersPage';
import BuyerOrderDetailPage from './pages/buyer/BuyerOrderDetailPage';
import WishlistPage from './pages/buyer/WishlistPage';
import DisputesListPage from './pages/buyer/DisputesListPage';
import DisputeDetailPage from './pages/buyer/DisputeDetailPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';
import { ProfilePage } from './pages/profile/ProfilePage';
import { ChangePasswordPage } from './pages/profile/ChangePasswordPage';

import { SellerDashboard } from './pages/seller/SellerDashboard';
import { CreateListingPage } from './pages/seller/CreateListingPage';
import { EditListingPage } from './pages/seller/EditListingPage';
import { SellerOrdersPage } from './pages/seller/SellerOrdersPage';
import SellerOrderDetailPage from './pages/seller/SellerOrderDetailPage';

import { InspectorDashboard } from './pages/inspector/InspectorDashboard';
import { InspectorListingsPage } from './pages/inspector/InspectorListingsPage';
import { InspectionFormPage } from './pages/inspector/InspectionFormPage';

import { AdminLayout } from './layouts/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminListingsPage } from './pages/admin/AdminListingsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminCatalogPage } from './pages/admin/AdminCatalogPage';
import AdminTransactionsPage from './pages/admin/AdminTransactionsPage';
import AdminDisputesPage from './pages/admin/AdminDisputesPage';
import AdminDepositPolicyPage from './pages/admin/AdminDepositPolicyPage';
import AdminOrderDetailPage from './pages/admin/AdminOrderDetailPage';
import { VNPayReturnPage } from './pages/payment/VNPayReturnPage';

import { Loading } from './components/ui';

function App() {
  const { checkAuth, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      console.log('🚀 Starting SignalR connections...');
      // Start connections and wait for them to be ready
      Promise.all([
        signalRService.startNotificationConnection(),
        signalRService.startChatConnection()
      ]).then(() => {
        console.log('✅ All SignalR connections ready');
      });

      // Don't cleanup connections on re-render
      // Only stop on window unload
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Cleanup on window unload
    const handleUnload = () => {
      signalRService.stopAllConnections();
    };
    
    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, []);

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      {isAuthenticated && <ChatBubble />}
      <Routes>
        <Route path={ROUTES.HOME} element={<HomePage />} />
        <Route path={ROUTES.SEARCH} element={<SearchPage />} />
        <Route path={ROUTES.LISTING_DETAIL} element={<ListingDetailPage />} />
        <Route path={ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
        
        <Route path="/notifications" element={
          <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.SELLER, UserRole.ADMIN, UserRole.INSPECTOR]}>
            <NotificationsPage />
          </ProtectedRoute>
        } />
        
        <Route path="/profile" element={
          <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.SELLER, UserRole.ADMIN, UserRole.INSPECTOR]}>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/change-password" element={
          <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.SELLER, UserRole.ADMIN, UserRole.INSPECTOR]}>
            <ChangePasswordPage />
          </ProtectedRoute>
        } />
        
        <Route path="/payment/vnpay-return" element={<VNPayReturnPage />} />

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
              <BuyerOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/orders/:id"
          element={
            <ProtectedRoute allowedRoles={[UserRole.BUYER]}>
              <BuyerOrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/wishlist"
          element={
            <ProtectedRoute allowedRoles={[UserRole.BUYER]}>
              <WishlistPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/disputes"
          element={
            <ProtectedRoute allowedRoles={[UserRole.BUYER]}>
              <DisputesListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/buyer/disputes/:id"
          element={
            <ProtectedRoute allowedRoles={[UserRole.BUYER, UserRole.ADMIN, UserRole.INSPECTOR]}>
              <DisputeDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.SELLER_ORDERS}
          element={
            <ProtectedRoute allowedRoles={[UserRole.SELLER]}>
              <SellerOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/seller/orders/:id"
          element={
            <ProtectedRoute allowedRoles={[UserRole.SELLER]}>
              <SellerOrderDetailPage />
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
          path="/seller/listings/:id/edit"
          element={
            <ProtectedRoute allowedRoles={[UserRole.SELLER]}>
              <EditListingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={ROUTES.INSPECTOR_DASHBOARD}
          element={
            <ProtectedRoute allowedRoles={[UserRole.INSPECTOR]}>
              <InspectorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.INSPECTOR_LISTINGS}
          element={
            <ProtectedRoute allowedRoles={[UserRole.INSPECTOR]}>
              <InspectorListingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.INSPECTOR_INSPECTION}
          element={
            <ProtectedRoute allowedRoles={[UserRole.INSPECTOR]}>
              <InspectionFormPage />
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
          path={ROUTES.ADMIN_USERS}
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminLayout>
                <AdminUsersPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/transactions"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminLayout>
                <AdminTransactionsPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/disputes"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.INSPECTOR]}>
              <AdminLayout>
                <AdminDisputesPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/disputes/:id"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN, UserRole.INSPECTOR]}>
              <AdminLayout>
                <DisputeDetailPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/deposit-policy"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminLayout>
                <AdminDepositPolicyPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders/:id"
          element={
            <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
              <AdminLayout>
                <AdminOrderDetailPage />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path={ROUTES.ADMIN_CATALOG}
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
