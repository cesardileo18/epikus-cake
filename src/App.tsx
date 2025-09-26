// App.tsx
import { BrowserRouter} from 'react-router-dom';
import Navbar from './components/Navbar';
import CartDrawer from './components/cart/CartDrawer';
import AppRoutes from './routes/AppRoutes';
import ScrollToTopButton from './components/ScrollToTopButton';
function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <AppRoutes />
        <CartDrawer />
        <ScrollToTopButton />
      </div>
    </BrowserRouter>
  );
}

export default App;