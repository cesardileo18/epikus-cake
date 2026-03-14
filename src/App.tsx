// App.tsx
import { BrowserRouter } from "react-router-dom";
import Navbar from "@/components/navbar/Navbar";
import CartDrawer from "@/components/cart/CartDrawer";
import AppRoutes from "@/routes/AppRoutes";
import ScrollToTopButton from "@/components/buttons/ScrollToTopButton";
import Footer from "@/components/footer/Footer";
import FloatingWhatsApp from "@/components/buttons/FloatingWhatsApp";
import ScrollToTop from "@/components/scroll/ScrollToTop";
import ToastProvider, { showToast } from "@/components/Toast/ToastProvider";
import { useStoreStatus } from "@/context/StoreStatusContext";
import { useEffect } from "react";
import AnalyticsTracker from "./components/analyticsTracker/AnalyticsTracker";

function App() {
  const { isStoreOpen, closedMessage } = useStoreStatus();

  useEffect(() => {
    if (!isStoreOpen && closedMessage) {
      showToast.custom(
        closedMessage,
        {
          icon: "🕒",
          duration: 6000,
          style: {
            background: "var(--color-bg-card)",
            border: "2px solid var(--color-border)",
            fontWeight: "600",
            color: "var(--color-text-primary)",
          },
        }
      );
    }
  }, [isStoreOpen, closedMessage]);

  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <ScrollToTop />
      <div className="App">
        <Navbar />
        <AppRoutes />
        <Footer />
        <CartDrawer />
        <ScrollToTopButton />
        <FloatingWhatsApp />
      </div>
      <ToastProvider />
    </BrowserRouter>
  );
}

export default App;