// src/routes/AppRoutes.tsx
import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";


// ====== lazy imports (code-splitting) ======
const Home = lazy(() => import("@/views/Home"));
const Products = lazy(() => import("@/views/Products"));
const Dashboard = lazy(() => import("@/views/admin/dashboard/Dashboard"));
const AddProduct = lazy(() => import("@/views/admin/products/AddProduct"));
const ProductsList = lazy(() => import("@/views/admin/products/ProductsList"));
const Login = lazy(() => import("@/views/Login"));
const AuthCallback = lazy(() => import("@/views/AuthCallback"));
const Checkout = lazy(() => import("@/views/Checkout"));
const Contact = lazy(() => import("@/views/Contact"));
const AboutUs = lazy(() => import("@/views/AboutUs"));
const ProductDetail = lazy(() => import("@/views/ProductDetail"));
const ConfirmOrder = lazy(() => import("@/views/ConfirmOrder")); 
const PrivacyPolicy = lazy(() => import("@/views/Privacidad")); 
const TermsAndConditions = lazy(() => import("@/views/TermsAndConditions")); 
// ====== tipos de rol (mantener en sync con lo que guardás en Firestore) ======
type Role = "admin" | "customer" | "viewer";

// ====== Loader simple ======
const Loader = () => (
  <div className="grid place-items-center min-h-[40vh]">
    <div className="h-10 w-10 border-4 border-gray-300 border-t-transparent rounded-full animate-spin" />
  </div>
);

// ====== Guard genérico ======
const ProtectedRoute: React.FC<{ requiredRole?: Role }> = ({ requiredRole }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <Loader />;

  // no logueado -> al login con redirect
  if (!user) {
    const redirect = encodeURIComponent(window.location.pathname + window.location.search);
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  // sin rol requerido
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

// ====== Layout admin mínimo (opcional para sidebar/header admin) ======
const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* acá podrías poner <AdminSidebar/> o <AdminHeader/> */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};

// ====== 404 ======
const NotFound = () => (
  <div className="grid place-items-center min-h-[50vh] text-center">
    <h1 className="text-3xl font-bold mb-2">404</h1>
    <p className="text-gray-600 mb-6">La página que buscás no existe.</p>
    <a href="/" className="text-pink-600 font-semibold hover:underline">Volver al inicio</a>
  </div>
);

// ====== Rutas ======
const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        {/* públicas */}
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
        {/* admin protegidas */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/products" element={<ProductsList />} />
            <Route path="/admin/products/add" element={<AddProduct />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
