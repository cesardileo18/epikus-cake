import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/navbar/Navbar';
import CartDrawer from '@/components/cart/CartDrawer';
import ScrollToTopButton from '@/components/buttons/ScrollToTopButton';
import Footer from '@/components/footer/Footer';
import FloatingWhatsApp from '@/components/buttons/FloatingWhatsApp';
import { useStoreStatus } from '@/context/StoreStatusContext';
import { showToast } from '@/components/Toast/ToastProvider';

const PublicLayout: React.FC = () => {
  const { isStoreOpen, closedMessage } = useStoreStatus();

  useEffect(() => {
    if (!isStoreOpen && closedMessage) {
      showToast.custom(closedMessage, {
        icon: '🕒',
        duration: 6000,
        style: {
          background: 'var(--color-bg-card)',
          border: '2px solid var(--color-border)',
          fontWeight: '600',
          color: 'var(--color-text-primary)',
        },
      });
    }
  }, [isStoreOpen, closedMessage]);

  return (
    <div className="App">
      <Navbar />
      <Outlet />
      <Footer />
      <CartDrawer />
      <ScrollToTopButton />
      <FloatingWhatsApp />
    </div>
  );
};

export default PublicLayout;
