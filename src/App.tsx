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
import { StoreStatusProvider } from "@/context/StoreStatusContext";
import { useStoreStatus } from "@/context/StoreStatusContext";
import { useEffect } from "react";

function App() {
  const { isStoreOpen, closedMessage } = useStoreStatus();

  useEffect(() => {
    if (!isStoreOpen) {
      showToast.custom(
        closedMessage || "Tienda cerrada temporalmente",
        {
          icon: "🕒",
          duration: 6000,
          style: {
            background: "linear-gradient(135deg, #fff 0%, #fdf2f8 100%)",
            border: "2px solid #fbcfe8",
            fontWeight: "600",
            color: "#1f2937",
          },
        }
      );
    }
  }, [isStoreOpen, closedMessage]);
  
  return (
    <BrowserRouter>
      <StoreStatusProvider>
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
      </StoreStatusProvider>
    </BrowserRouter>
  );
}

export default App;
