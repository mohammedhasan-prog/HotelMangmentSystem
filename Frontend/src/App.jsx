import { Navigate, Route, Routes } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import AdminPanelLayout from './components/AdminPanelLayout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import HomePage from './pages/HomePage';
import HotelsPage from './pages/HotelsPage';
import HotelDetailsPage from './pages/HotelDetailsPage';
import BookingPage from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import DashboardPage from './pages/DashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminManageHotelsPage from './pages/AdminManageHotelsPage';
import AdminCreateHotelPage from './pages/AdminCreateHotelPage';
import AdminManageBookingsPage from './pages/AdminManageBookingsPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

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

      <Route path="/admin" element={<Navigate to="/admin/manage-hotels" replace />} />

      <Route
        path="/admin/manage-hotels"
        element={(
          <ProtectedRoute requiredRole="ADMIN" redirectTo="/admin/login">
            <AdminPanelLayout>
              <AdminManageHotelsPage />
            </AdminPanelLayout>
          </ProtectedRoute>
        )}
      />

      <Route
        path="/admin/create-hotel"
        element={(
          <ProtectedRoute requiredRole="ADMIN" redirectTo="/admin/login">
            <AdminPanelLayout>
              <AdminCreateHotelPage />
            </AdminPanelLayout>
          </ProtectedRoute>
        )}
      />

      <Route
        path="/admin/manage-bookings"
        element={(
          <ProtectedRoute requiredRole="ADMIN" redirectTo="/admin/login">
            <AdminPanelLayout>
              <AdminManageBookingsPage />
            </AdminPanelLayout>
          </ProtectedRoute>
        )}
      />

      <Route
        path="/admin/analytics"
        element={(
          <ProtectedRoute requiredRole="ADMIN" redirectTo="/admin/login">
            <AdminPanelLayout>
              <AdminAnalyticsPage />
            </AdminPanelLayout>
          </ProtectedRoute>
        )}
      />

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
