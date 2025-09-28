// App.tsx
import { BrowserRouter } from 'react-router-dom';
import Navbar from './components/navbar/Navbar';
import CartDrawer from './components/cart/CartDrawer';
import AppRoutes from './routes/AppRoutes';
import ScrollToTopButton from './components/buttons/ScrollToTopButton';
import Footer from './components/footer/Footer';
import FloatingWhatsApp from './components/buttons/FloatingWhatsApp';
import ScrollToTop from './components/scroll/ScrollToTop';
function App() {
  return (
    <BrowserRouter>
      <ScrollToTop /> 
      <div className="App">
        <Navbar />
        <AppRoutes />
        <Footer />
        <CartDrawer />
        <ScrollToTopButton />
        <FloatingWhatsApp />
      </div>
    </BrowserRouter>
  );
}

export default App;