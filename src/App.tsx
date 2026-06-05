import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/routes/AppRoutes';
import ScrollToTop from '@/components/scroll/ScrollToTop';
import ToastProvider from '@/components/Toast/ToastProvider';
import AnalyticsTracker from '@/components/analyticsTracker/AnalyticsTracker';

function App() {
  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <ScrollToTop />
      <AppRoutes />
      <ToastProvider />
    </BrowserRouter>
  );
}

export default App;
