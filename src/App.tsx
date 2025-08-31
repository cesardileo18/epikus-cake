// App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './views/Home';
import Products from './views/Products';
import Dashboard from './views/admin/dashboard/Dashboard';
import AddProduct from './views/admin/products/AddProduct';
import ProductsList from './views/admin/products/ProductsList';
import Login from './views/Login';
import AuthCallback from './views/AuthCallback';
import CartDrawer from './components/cart/CartDrawer';
import Checkout from './views/Checkout';
import Contact from './views/Contact';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <Routes>
          {/* Rutas públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/about" element={<div>Sobre nosotros</div>} />
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/contact" element={<Contact />} />

          {/* Rutas admin */}
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/products" element={<ProductsList />} />
          <Route path="/admin/products/add" element={<AddProduct />} />
        </Routes>
        <CartDrawer />
      </div>
    </BrowserRouter>
  );
}

export default App;