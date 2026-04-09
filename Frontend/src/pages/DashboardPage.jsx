import { useEffect, useMemo, useState } from 'react';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { FiCalendar, FiHeart, FiMapPin, FiMoreHorizontal, FiShield, FiUser } from 'react-icons/fi';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

function getHotelImage(hotel) {
  const fallback = 'https://images.unsplash.com/photo-1566073771259-6a8506099945';
  const raw = hotel?.photos;

  if (Array.isArray(raw)) {
    return raw[0] || fallback;
  }

  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed[0]) {
        return parsed[0];
      }
    } catch {
      const split = raw.split(',').map((item) => item.trim()).filter(Boolean);
      if (split[0]) {
        return split[0];
      }
    }
  }

  return fallback;
}

function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    api.get('/bookings/history')
      .then((data) => setBookings(data?.data?.bookings || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const cancelBooking = async (id) => {
    try {
      await api.patch(`/bookings/${id}/cancel`, {});
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const enhancedBookings = useMemo(() => {
    const now = new Date();
    return bookings.map((booking) => {
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const status = String(booking.status || '').toUpperCase();

      let badge = 'Upcoming';
      if (status === 'COMPLETED' || checkOut < now) badge = 'Completed';
      if (status === 'CANCELLED') badge = 'Canceled';

      return {
        ...booking,
        uiBadge: badge,
      };
    });
  }, [bookings]);

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase() || 'JD';
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Guest Traveler';
  const email = user?.email || 'traveler@voyager.com';

  if (loading) return <p>Loading your bookings...</p>;

  return (
    <div className="stack-lg user-dashboard-shell">
      <div className="user-dashboard-layout">
        <aside className="user-sidebar-card">
          <nav className="user-dashboard-nav">
            <button className="active" type="button"><FiCalendar size={16} /> My Bookings</button>
            <button type="button"><FiHeart size={16} /> Wishlist</button>
            <button type="button"><FiUser size={16} /> Profile Settings</button>
            <button type="button"><FiShield size={16} /> Security</button>
          </nav>

          <div className="profile-mini-card">
            <div className="avatar-circle">{initials}</div>
            <div>
              <strong>{fullName}</strong>
              <p>{email}</p>
            </div>
            <Button variant="contained" color="secondary" fullWidth>Save Changes</Button>
          </div>
        </aside>

        <section className="user-history-zone">
          <header className="user-history-head">
            <span>Your Journey History</span>
            <h1>My Booking History</h1>
          </header>

          {error && <p className="error-text">{error}</p>}

          <div className="history-card-grid">
            {enhancedBookings.map((b) => (
              <article key={b.id} className="journey-card">
                <img src={getHotelImage(b.hotel)} alt={b.hotel?.name || 'Hotel'} />

                <div className="journey-card-body">
                  <div className="journey-meta-head">
                    <span className={`journey-badge ${b.uiBadge.toLowerCase()}`}>{b.uiBadge}</span>
                    <span className="journey-rating">⭐ {Number(b.hotel?.rating || 4.8).toFixed(1)}</span>
                  </div>

                  <h3>{b.hotel?.name || 'Hotel Stay'}</h3>
                  <p><FiCalendar size={13} /> {new Date(b.checkInDate).toLocaleDateString()} - {new Date(b.checkOutDate).toLocaleDateString()}</p>
                  <p><FiMapPin size={13} /> {b.hotel?.location || b.hotel?.city || 'Destination pending'}</p>

                  <div className="journey-actions">
                    {b.uiBadge === 'Upcoming' && (
                      <>
                        <Button component={Link} to="/hotels" variant="contained" color="primary">View Details</Button>
                        <Button variant="outlined" color="inherit" startIcon={<FiMoreHorizontal />}>More</Button>
                      </>
                    )}

                    {b.uiBadge === 'Completed' && (
                      <>
                        <Button component={Link} to="/hotels" variant="contained" color="secondary">Rebook</Button>
                        <Button variant="outlined" color="inherit">Write Review</Button>
                      </>
                    )}

                    {b.uiBadge === 'Canceled' && (
                      <Button variant="outlined" color="inherit">View Refund Status</Button>
                    )}

                    {b.uiBadge === 'Upcoming' && (
                      <Button variant="text" color="error" onClick={() => cancelBooking(b.id)}>Cancel</Button>
                    )}
                  </div>
                </div>
              </article>
            ))}

            {!enhancedBookings.length && (
              <article className="journey-card empty-journey-card">
                <div className="journey-card-body">
                  <h3>No bookings yet</h3>
                  <p>Start your first stay and your booking history will appear here.</p>
                  <Button component={Link} to="/hotels" variant="contained" color="primary">Explore Destinations</Button>
                </div>
              </article>
            )}

            <article className="journey-promo-card">
              <span>Member Exclusive</span>
              <h3>Ready for your next escape?</h3>
              <p>As a premium member, you have upgrades available for your next trip.</p>
              <Button component={Link} to="/hotels" variant="contained" color="inherit">Explore Destinations</Button>
            </article>
          </div>
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
