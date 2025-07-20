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

function App() {
  const { isLoading: isAuthLoading } = useAuth();
  const { user } = useStore();

  console.log('🎯 App.tsx - Current user:', user);
  console.log('🎯 App.tsx - Auth loading:', isAuthLoading);

  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  // --- שינוי לוגיקת הניווט ---
  // משתמש רשום הוא משתמש שיש לו כתובת אימייל
  const isRegisteredUser = user && user.email;

  return (
    <>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
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
        
        <Route 
          path="/" 
          element={<Navigate to={isRegisteredUser ? "/dashboard" : "/login"} />} 
        />
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

export default App;