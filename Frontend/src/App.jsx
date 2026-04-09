import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import HotelsPage from './pages/HotelsPage';
import HotelDetailsPage from './pages/HotelDetailsPage';
import BookingPage from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import DashboardPage from './pages/DashboardPage';
import AdminPage from './pages/AdminPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />

      <Route
        path="/"
        element={(
          <MainLayout>
            <HomePage />
          </MainLayout>
        )}
      />

      <Route
        path="/hotels"
        element={(
          <MainLayout>
            <HotelsPage />
          </MainLayout>
        )}
      />

      <Route
        path="/hotels/:id"
        element={(
          <MainLayout>
            <HotelDetailsPage />
          </MainLayout>
        )}
      />

      <Route
        path="/booking"
        element={(
          <MainLayout>
            <ProtectedRoute>
              <BookingPage />
            </ProtectedRoute>
          </MainLayout>
        )}
      />

      <Route
        path="/booking-confirmation"
        element={(
          <MainLayout>
            <ProtectedRoute>
              <BookingConfirmationPage />
            </ProtectedRoute>
          </MainLayout>
        )}
      />

      <Route
        path="/dashboard"
        element={(
          <MainLayout>
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          </MainLayout>
        )}
      />

      <Route
        path="/admin"
        element={(
          <MainLayout>
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          </MainLayout>
        )}
      />

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
