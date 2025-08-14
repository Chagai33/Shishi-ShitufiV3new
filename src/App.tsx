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

import { Footer } from './components/Layout/Footer';
import TermsPage from './pages/TermsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import { ConfirmationModal } from './components/Admin/ConfirmationModal'; // <-- ייבוא המודאל
import React, { useState } from 'react';

function App() {
  const { isLoading: isAuthLoading } = useAuth();
  const { user, isDeleteAccountModalOpen, toggleDeleteAccountModal } = useStore(); // <-- קריאה למצב ולפונקציה
  
  // לוגיקה למחיקת חשבון
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
      setIsDeletingAccount(true);
      toast.loading('מוחק את החשבון והנתונים...', { id: 'delete-toast' });
      try {
          await FirebaseService.deleteCurrentUserAccount();
          toast.success('החשבון נמחק בהצלחה. תודה שהשתמשת בשירות!', { id: 'delete-toast' });
      } catch (error: any) {
          toast.error(error.message || 'שגיאה במחיקת החשבון.', { id: 'delete-toast' });
      } finally {
          toggleDeleteAccountModal();
          setIsDeletingAccount(false);
      }
  };

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
      {/* הוספת המודאל כאן */}
      {isDeleteAccountModalOpen && (
        <ConfirmationModal
          message={`האם אתה בטוח שברצונך למחוק את חשבונך?\nפעולה זו הינה **בלתי הפיכה** ותמחק את כל האירועים, הפריטים והשיבוצים המשויכים לך.`}
          onClose={toggleDeleteAccountModal}
          options={[
            {
              label: isDeletingAccount ? 'מוחק...' : 'כן, מחק את החשבון',
              onClick: handleDeleteAccount,
              className: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300'
            }
          ]}
        />
      )}
    </div>
  );
}

export default App;