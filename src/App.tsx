// src/App.tsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { useStore } from './store/useStore';

import DashboardPage from './pages/DashboardPage';
import EventPage from './pages/EventPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import LoadingSpinner from './components/Common/LoadingSpinner';

// --- ייבוא הקבצים החדשים ---
import { Footer } from './components/Layout/Footer';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

function App() {
  const { isLoading: isAuthLoading } = useAuth();
  const { user } = useStore();

  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  const isRegisteredUser = user && user.email;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <main className="flex-grow">
        <Routes>
          <Route 
            path="/login" 
            element={isRegisteredUser ? <Navigate to="/dashboard" /> : <LoginPage />} 
          />
          
          <Route 
            path="/dashboard" 
            element={isRegisteredUser ? <DashboardPage /> : <Navigate to="/login" />} 
          />
          
          <Route path="/event/:eventId" element={<EventPage />} />

          {/* --- הוספת הראוטינג לעמודים החדשים --- */}
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          
          <Route 
            path="/" 
            element={<Navigate to={isRegisteredUser ? "/dashboard" : "/login"} />} 
          />
          
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;