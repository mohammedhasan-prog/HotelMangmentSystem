import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Alert, Button, Snackbar } from '@mui/material';
import { FiBarChart2, FiBookOpen, FiGrid, FiHome, FiLogOut, FiSettings } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

function AdminPanelLayout({ children }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const latestBookingIdRef = useRef(null);
  const initializedRef = useRef(false);

  const onLogout = () => {
    logout();
    navigate('/admin/login');
  };

  useEffect(() => {
    let active = true;

    const checkLatestBooking = async () => {
      try {
        const response = await api.get('/admin/bookings/recent?limit=1');
        const latest = response?.data?.bookings?.[0];
        if (!latest || !active) return;

        if (!initializedRef.current) {
          latestBookingIdRef.current = latest.id;
          initializedRef.current = true;
          return;
        }

        if (latestBookingIdRef.current !== latest.id) {
          latestBookingIdRef.current = latest.id;

          const guestName = [latest.user?.firstName, latest.user?.lastName].filter(Boolean).join(' ') || latest.user?.email || 'Guest';
          const hotelName = latest.hotel?.name || 'a hotel';

          setToastMessage(`New booking from ${guestName} at ${hotelName}`);
          setToastOpen(true);
          window.dispatchEvent(new CustomEvent('admin:new-booking', { detail: latest }));
        }
      } catch (error) {
        // Intentionally silent: polling should not interrupt admin workflow.
      }
    };

    checkLatestBooking();
    const intervalId = setInterval(checkLatestBooking, 7000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      <div className="admin-shell">
        <aside className="admin-sidebar">
          <h2><Link to="/admin/manage-hotels">The Elevated Voyager</Link></h2>

          <nav className="admin-menu">
            <NavLink to="/admin/manage-hotels" className={({ isActive }) => (isActive ? 'active' : '')}>
              <FiGrid size={15} /> Dashboard Overview
            </NavLink>
            <NavLink to="/admin/create-hotel" className={({ isActive }) => (isActive ? 'active' : '')}>
              <FiHome size={15} /> Manage Hotels
            </NavLink>
            <NavLink to="/admin/manage-bookings" className={({ isActive }) => (isActive ? 'active' : '')}>
              <FiBookOpen size={15} /> Manage Bookings
            </NavLink>
            <NavLink to="/admin/analytics" className={({ isActive }) => (isActive ? 'active' : '')}>
              <FiBarChart2 size={15} /> Analytics
            </NavLink>
            <button type="button" disabled>
              <FiSettings size={15} /> Settings
            </button>
          </nav>

          <div className="admin-user-card">
            <div className="admin-user-avatar">{(user?.firstName || 'A').slice(0, 2).toUpperCase()}</div>
            <div>
              <strong>{user?.firstName || 'Admin'} {user?.lastName || ''}</strong>
              <p>Super Admin</p>
            </div>
            <Button onClick={onLogout} variant="text" size="small" startIcon={<FiLogOut size={14} />}>Sign out</Button>
          </div>
        </aside>

        <main className="admin-main-shell">
          <div className="admin-main-content">{children}</div>

          <footer className="admin-main-footer">
            <section>
              <h4>The Elevated Voyager</h4>
              <p>Advanced property management and concierge analytics for the modern hospitality leader.</p>
            </section>
            <section>
              <h5>Contact</h5>
              <a href="#">Support Center</a>
              <a href="#">API Documentation</a>
            </section>
            <section>
              <h5>Resources</h5>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </section>
            <section>
              <p>© 2024 The Elevated Voyager. All rights reserved.</p>
            </section>
          </footer>
        </main>
      </div>

      <Snackbar
        open={toastOpen}
        autoHideDuration={3500}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity="info" variant="filled">
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default AdminPanelLayout;
