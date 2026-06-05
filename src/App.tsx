import { BrowserRouter } from 'react-router-dom';
import AppRoutes from '@/routes/AppRoutes';
import ScrollToTop from '@/components/scroll/ScrollToTop';
import ToastProvider from '@/components/feedback/ToastProvider';
import AnalyticsTracker from '@/components/analytics/AnalyticsTracker';

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
