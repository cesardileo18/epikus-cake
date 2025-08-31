// App.tsx
import { BrowserRouter} from 'react-router-dom';
import Navbar from './components/Navbar';
import CartDrawer from './components/cart/CartDrawer';
import AppRoutes from './routes/AppRoutes';
function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar />
        <AppRoutes />
        <CartDrawer />
      </div>
    </BrowserRouter>
  );
}

export default App;