import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from '@mui/material';
import {
  FiDollarSign,
  FiEdit2,
  FiHome,
  FiMapPin,
  FiMoreVertical,
  FiPlus,
  FiSearch,
  FiStar,
  FiTrash2,
} from 'react-icons/fi';
import { api } from '../lib/api';

const toCsv = (value) => (Array.isArray(value) ? value.join(', ') : '');

function AdminManageHotelsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [hotels, setHotels] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState({
    totalRevenue: 0,
    activeBookings: 0,
    weeklyBookings: [0, 0, 0, 0],
    revenueDeltaPercent: 0,
  });
  const [editHotel, setEditHotel] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    city: '',
    location: '',
    description: '',
    rating: 4,
    amenities: '',
    photos: '',
  });

  const hasHotels = useMemo(() => hotels.length > 0, [hotels]);

  const filteredHotels = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return hotels;

    return hotels.filter((hotel) => {
      const haystack = `${hotel.name} ${hotel.city} ${hotel.location}`.toLowerCase();
      return haystack.includes(term);
    });
  }, [hotels, search]);

  const topHotels = useMemo(() => {
    return [...hotels]
      .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0))
      .slice(0, 3);
  }, [hotels]);

  const avgRating = useMemo(() => {
    if (!hotels.length) return 0;
    const total = hotels.reduce((sum, hotel) => sum + Number(hotel.rating || 0), 0);
    return total / hotels.length;
  }, [hotels]);

  const totalRevenue = useMemo(() => {
    return Number(dashboardSummary.totalRevenue || 0);
  }, [dashboardSummary]);

  const activeBookings = useMemo(() => {
    return Number(dashboardSummary.activeBookings || 0);
  }, [dashboardSummary]);

  const bookingBars = useMemo(() => {
    const values = Array.isArray(dashboardSummary.weeklyBookings) && dashboardSummary.weeklyBookings.length
      ? dashboardSummary.weeklyBookings
      : [0, 0, 0, 0];
    const max = Math.max(...values, 1);
    return values.map((value) => Math.max(14, Math.round((value / max) * 90)));
  }, [dashboardSummary]);

  const recentRows = useMemo(() => {
    return recentBookings.map((booking) => {
      const guestName = [booking.user?.firstName, booking.user?.lastName].filter(Boolean).join(' ') || booking.user?.email || 'Guest';
      const checkIn = new Date(booking.checkInDate);
      const checkOut = new Date(booking.checkOutDate);
      const dateText = `${checkIn.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - ${checkOut.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`;
      const readableStatus = booking.status ? booking.status.charAt(0) + booking.status.slice(1).toLowerCase() : 'Pending';

      return {
        id: booking.id,
        guest: guestName,
        hotel: booking.hotel?.name || 'Unknown Hotel',
        dates: dateText,
        price: Number(booking.totalAmount || 0).toFixed(2),
        status: readableStatus,
        avatar: booking.hotel?.photos?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
      };
    });
  }, [recentBookings]);

  const fetchHotels = async () => {
    setLoading(true);
    setError('');

    try {
      const [hotelsResponse, recentBookingsResponse] = await Promise.all([
        api.get('/admin/hotels'),
        api.get('/admin/bookings/recent?limit=8'),
      ]);

      setHotels(hotelsResponse?.data?.hotels || []);
      setRecentBookings(recentBookingsResponse?.data?.bookings || []);
      setDashboardSummary({
        totalRevenue: recentBookingsResponse?.data?.summary?.totalRevenue || 0,
        activeBookings: recentBookingsResponse?.data?.summary?.activeBookings || 0,
        weeklyBookings: recentBookingsResponse?.data?.summary?.weeklyBookings || [0, 0, 0, 0],
        revenueDeltaPercent: recentBookingsResponse?.data?.summary?.revenueDeltaPercent || 0,
      });
    } catch (err) {
      setError(err.message || 'Failed to load hotels.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    const onNewBooking = () => {
      fetchHotels();
    };

    window.addEventListener('admin:new-booking', onNewBooking);
    return () => window.removeEventListener('admin:new-booking', onNewBooking);
  }, []);

  const openEdit = (hotel) => {
    setMessage('');
    setError('');
    setEditHotel(hotel);
    setEditForm({
      name: hotel.name || '',
      city: hotel.city || '',
      location: hotel.location || '',
      description: hotel.description || '',
      rating: hotel.rating || 0,
      amenities: toCsv(hotel.amenities),
      photos: toCsv(hotel.photos),
    });
  };

  const closeEdit = () => setEditHotel(null);

  const updateEditField = (field) => (event) => {
    setEditForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const onSaveHotel = async () => {
    if (!editHotel?.id) return;

    setError('');
    setMessage('');

    try {
      await api.patch(`/admin/hotels/${editHotel.id}`, {
        ...editForm,
        rating: Number(editForm.rating),
        amenities: editForm.amenities.split(',').map((item) => item.trim()).filter(Boolean),
        photos: editForm.photos.split(',').map((item) => item.trim()).filter(Boolean),
      });

      setMessage('Hotel updated successfully.');
      closeEdit();
      fetchHotels();
    } catch (err) {
      setError(err.message || 'Failed to update hotel.');
    }
  };

  const onDeleteHotel = async (hotelId) => {
    if (!window.confirm('Delete this hotel? This will also delete related rooms and bookings.')) {
      return;
    }

    setError('');
    setMessage('');

    try {
      await api.delete(`/admin/hotels/${hotelId}`);
      setMessage('Hotel deleted successfully.');
      fetchHotels();
    } catch (err) {
      setError(err.message || 'Failed to delete hotel.');
    }
  };

  return (
    <section className="ad-shell">
      <header className="ad-top">
        <div>
          <h1>Dashboard Overview</h1>
          <p>Welcome back, manager.</p>
        </div>

        <div className="ad-top-actions">
          <label className="ad-search">
            <FiSearch size={14} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search data..." />
          </label>
          <Button component={Link} to="/admin/create-hotel" variant="contained" startIcon={<FiPlus />}>
            Add New Hotel
          </Button>
        </div>
      </header>

      {error && <Alert severity="error">{error}</Alert>}
      {message && <Alert severity="success">{message}</Alert>}

      {loading ? (
        <div className="admin-loading"><CircularProgress /></div>
      ) : !hasHotels ? (
        <div className="admin-empty">No hotels found. Create your first hotel entry.</div>
      ) : (
        <>
          <div className="ad-metrics">
            <article className="ad-metric-card">
              <div>
                <span><FiDollarSign size={15} /></span>
                <small>{dashboardSummary.revenueDeltaPercent >= 0 ? '+' : ''}{dashboardSummary.revenueDeltaPercent}%</small>
              </div>
              <p>Total Revenue</p>
              <strong>${Math.round(totalRevenue).toLocaleString()}</strong>
            </article>

            <article className="ad-metric-card">
              <div>
                <span><FiHome size={15} /></span>
                <small>+8%</small>
              </div>
              <p>Active Bookings</p>
              <strong>{activeBookings.toLocaleString()}</strong>
            </article>

            <article className="ad-metric-card">
              <div>
                <span><FiHome size={15} /></span>
                <small>Stable</small>
              </div>
              <p>Total Properties</p>
              <strong>{hotels.length}</strong>
            </article>

            <article className="ad-metric-card">
              <div>
                <span><FiStar size={15} /></span>
                <small>High</small>
              </div>
              <p>Avg Rating</p>
              <strong>{avgRating.toFixed(1)}</strong>
            </article>
          </div>

          <div className="ad-main-grid">
            <article className="ad-chart-card">
              <div className="ad-chart-head">
                <div>
                  <h3>Bookings over time</h3>
                  <p>Data visualized for the last 30 days</p>
                </div>
                <button type="button">Last 30 Days</button>
              </div>

              <div className="ad-bars">
                {bookingBars.map((value, index) => (
                  <span key={value + index} style={{ height: `${Math.min(95, value)}%` }} />
                ))}
              </div>

              <div className="ad-bars-legend">
                <small>Week 1</small>
                <small>Week 2</small>
                <small>Week 3</small>
                <small>Week 4</small>
              </div>
            </article>

            <article className="ad-top-hotels">
              <h3>Top Performing</h3>
              <div>
                {topHotels.map((hotel) => (
                  <div className="ad-top-row" key={hotel.id}>
                    <img src={hotel.photos?.[0]} alt={hotel.name} />
                    <div>
                      <strong>{hotel.name}</strong>
                      <p>${Number(hotel.rooms?.[0]?.price || 100).toFixed(0)} / night avg</p>
                      <small>
                        <FiStar size={11} /> {Number(hotel.rating || 0).toFixed(1)}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/admin/create-hotel">View All Properties</Link>
            </article>
          </div>

          <article className="ad-table-card">
            <header>
              <h3>Recent Bookings</h3>
              <button type="button">View All</button>
            </header>

            <table className="ad-table">
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Hotel</th>
                  <th>Dates</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {recentRows.map((row) => (
                  <tr key={row.id}>
                    <td className="ad-guest-cell">
                      <img src={row.avatar} alt={row.guest} />
                      <span>{row.guest}</span>
                    </td>
                    <td>{row.hotel}</td>
                    <td>{row.dates}</td>
                    <td>${row.price}</td>
                    <td>
                      <Chip
                        label={row.status}
                        size="small"
                        color={row.status === 'Confirmed' ? 'primary' : row.status === 'Cancelled' ? 'error' : 'warning'}
                        variant="outlined"
                      />
                    </td>
                    <td><FiMoreVertical /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>

          <article className="ad-table-card" id="admin-inventory">
            <header>
              <h3>Hotel Inventory</h3>
            </header>

            <table className="ad-table">
              <thead>
                <tr>
                  <th>Hotel</th>
                  <th>Location</th>
                  <th>Rooms</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredHotels.map((hotel) => (
                  <tr key={hotel.id}>
                    <td>{hotel.name}</td>
                    <td>
                      <span className="ad-location"><FiMapPin size={12} /> {hotel.city}</span>
                    </td>
                    <td>{hotel.rooms?.length || 0}</td>
                    <td>{Number(hotel.rating || 0).toFixed(1)}</td>
                    <td>
                      <Stack direction="row" spacing={1}>
                        <Button size="small" variant="outlined" startIcon={<FiEdit2 />} onClick={() => openEdit(hotel)}>
                          Edit
                        </Button>
                        <Button size="small" color="error" variant="outlined" startIcon={<FiTrash2 />} onClick={() => onDeleteHotel(hotel.id)}>
                          Delete
                        </Button>
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        </>
      )}

      <Dialog open={Boolean(editHotel)} onClose={closeEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Edit hotel</DialogTitle>
        <DialogContent className="admin-edit-dialog">
          <TextField label="Hotel Name" value={editForm.name} onChange={updateEditField('name')} fullWidth required />
          <TextField label="City" value={editForm.city} onChange={updateEditField('city')} fullWidth required />
          <TextField label="Location" value={editForm.location} onChange={updateEditField('location')} fullWidth required />
          <TextField label="Description" value={editForm.description} onChange={updateEditField('description')} multiline minRows={3} fullWidth />
          <TextField label="Rating" value={editForm.rating} onChange={updateEditField('rating')} type="number" inputProps={{ min: 0, max: 5, step: 0.1 }} fullWidth />
          <TextField label="Amenities" value={editForm.amenities} onChange={updateEditField('amenities')} fullWidth />
          <TextField label="Photos" value={editForm.photos} onChange={updateEditField('photos')} fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeEdit}>Cancel</Button>
          <Button onClick={onSaveHotel} variant="contained">Save changes</Button>
        </DialogActions>
      </Dialog>
    </section>
  );
}

export default AdminManageHotelsPage;
