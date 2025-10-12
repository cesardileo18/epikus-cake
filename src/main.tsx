// import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthProvider.tsx'
import { CartProvider } from './context/CartProvider.tsx'
import { initMercadoPago } from '@mercadopago/sdk-react';
initMercadoPago(import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '', { locale: 'es-AR' });
createRoot(document.getElementById('root')!).render(

  <AuthProvider>
    <CartProvider>
      <App />
    </CartProvider>
  </AuthProvider>,
)
