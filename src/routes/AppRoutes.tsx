import React, { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/context/AuthProvider';
import PublicLayout from '@/components/layout/PublicLayout';
import AdminLayout from '@/components/admin/AdminLayout';

const Home = lazy(() => import('@/views/Home'));
const Products = lazy(() => import('@/views/Products'));
const Dashboard = lazy(() => import('@/views/admin/dashboard/Dashboard'));
const AdminProductForm = lazy(() => import('@/views/admin/products/AdminProductForm'));
const AdminProducts = lazy(() => import('@/views/admin/products/AdminProducts'));
const Login = lazy(() => import('@/views/Login'));
const AuthCallback = lazy(() => import('@/views/AuthCallback'));
const Checkout = lazy(() => import('@/views/Checkout'));
const Contact = lazy(() => import('@/views/Contact'));
const AboutUs = lazy(() => import('@/views/AboutUs'));
const ProductDetail = lazy(() => import('@/views/ProductDetail'));
const ConfirmOrder = lazy(() => import('@/views/ConfirmOrder'));
const PrivacyPolicy = lazy(() => import('@/views/Privacidad'));
const TermsAndConditions = lazy(() => import('@/views/TermsAndConditions'));
const Profile = lazy(() => import('@/views/Profile'));
const MyOrders = lazy(() => import('@/views/MyOrders'));
const OrderSuccess = lazy(() => import('@/views/OrderSuccess'));
const AdminOrders = lazy(() => import('@/views/admin/orders/AdminOrders'));
const PaymentSuccess = lazy(() => import('@/views/payment/PaymentSuccess'));
const AdminUsers = lazy(() => import('@/views/admin/users/AdminUsers'));
const AdminMetrics = lazy(() => import('@/views/admin/metrics/AdminMetrics'));
const AdminSales = lazy(() => import('@/views/admin/sales/AdminSales'));
const AdminSettings = lazy(() => import('@/views/admin/settings/AdminSettings'));
const Favorites = lazy(() => import('@/views/Favorites'));
const ProductReviewsPage = lazy(() => import('@/views/ProductReviewsPage'));
const MyReviewsPage = lazy(() => import('@/views/MyReviewsPage'));
const OrdersCalendar = lazy(() => import('@/views/admin/orders/OrdersCalendar'));
const WholesalePage = lazy(() => import('@/views/WholesalePage'));

type Role = 'admin' | 'customer' | 'viewer';

const Loader = () => (
  <div className="grid min-h-[40vh] place-items-center" style={{ background: 'var(--color-bg-page)' }}>
    <div
      className="h-10 w-10 animate-spin rounded-full border-4 border-t-transparent"
      style={{ borderColor: 'var(--color-brand)', borderTopColor: 'transparent' }}
    />
  </div>
);

const AdminLoader = () => (
  <main className="grid min-h-screen place-items-center bg-slate-950 text-white">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-500 border-t-transparent" />
  </main>
);

const ProtectedRoute: React.FC<{ requiredRole?: Role }> = ({ requiredRole }) => {
  const { user, role, loading } = useAuth();

  if (loading) return requiredRole === 'admin' ? <AdminLoader /> : <Loader />;

  if (!user) {
    const redirect = encodeURIComponent(window.location.pathname + window.location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const NotFound = () => (
  <div
    className="grid min-h-[50vh] place-items-center px-4 text-center"
    style={{ background: 'var(--color-bg-page)' }}
  >
    <div>
      <div className="mb-4 text-6xl">🎂</div>
      <h1 className="mb-2 text-5xl font-bold text-brand-gradient">404</h1>
      <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
        La pagina que buscas no existe.
      </p>
      <a href="/" className="btn-brand inline-block px-6 py-3">
        Volver al inicio
      </a>
    </div>
  </div>
);

const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/new" element={<AdminProductForm />} />
            <Route path="/admin/products/add" element={<Navigate to="/admin/products/new" replace />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/sells" element={<Navigate to="/admin/orders" replace />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/metrics" element={<AdminMetrics />} />
            <Route path="/admin/analytics" element={<Navigate to="/admin/metrics" replace />} />
            <Route path="/admin/sales" element={<AdminSales />} />
            <Route path="/admin/sales-dashboard" element={<Navigate to="/admin/sales" replace />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/orders/calendar" element={<OrdersCalendar />} />
            <Route path="/admin/sells/calendar" element={<Navigate to="/admin/orders/calendar" replace />} />
            <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>

        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/confirm-order" element={<ConfirmOrder />} />
          <Route path="/privacidad" element={<PrivacyPolicy />} />
          <Route path="/terminos" element={<TermsAndConditions />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/products/:id/opiniones" element={<ProductReviewsPage />} />
          <Route path="/my-reviews" element={<MyReviewsPage />} />
          <Route path="/wholesale" element={<WholesalePage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
