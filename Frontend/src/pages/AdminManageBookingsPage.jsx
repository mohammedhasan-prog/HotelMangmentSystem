import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Chip, CircularProgress, MenuItem, TextField } from '@mui/material';
import { FiBell, FiCalendar, FiChevronLeft, FiChevronRight, FiFilter, FiPlus, FiSearch, FiSettings } from 'react-icons/fi';
import { api } from '../lib/api';

const STATUS_OPTIONS = [
  { label: 'All Reservations', value: 'ALL' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Cancelled', value: 'CANCELLED' },
];

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
}

function AdminManageBookingsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({
    occupancy: 0,
    totalRevenue: 0,
    activeBookings: 0,
  });
  const [insights, setInsights] = useState({
    reportTitle: '',
    reportSummary: '',
    reportLinkLabel: '',
    vipTag: '',
    vipTitle: '',
    vipSummary: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 4,
    total: 0,
    totalPages: 1,
  });
  const [filters, setFilters] = useState(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - 30);

    return {
      query: '',
      status: 'ALL',
      startDate: start.toISOString().slice(0, 10),
      endDate: now.toISOString().slice(0, 10),
    };
  });

  const dateRangeLabel = useMemo(() => {
    if (!filters.startDate || !filters.endDate) return 'Any Date';
    return `${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`;
  }, [filters.startDate, filters.endDate]);

  const fetchBookings = async (page = pagination.page) => {
    setLoading(true);
    setError('');

    const search = new URLSearchParams({
      page: String(page),
      limit: String(pagination.limit),
      status: filters.status,
      startDate: filters.startDate,
      endDate: filters.endDate,
      query: filters.query,
    });

    try {
      const response = await api.get(`/admin/bookings?${search.toString()}`);
      setBookings(response?.data?.bookings || []);
      setSummary(response?.data?.summary || { occupancy: 0, totalRevenue: 0, activeBookings: 0 });
      setInsights(response?.data?.insights || {
        reportTitle: '',
        reportSummary: '',
        reportLinkLabel: '',
        vipTag: '',
        vipTitle: '',
        vipSummary: '',
      });
      setPagination((prev) => ({
        ...prev,
        ...(response?.pagination || {}),
      }));
    } catch (err) {
      setError(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(1);
  }, [filters.status, filters.startDate, filters.endDate]);

  useEffect(() => {
    const onNewBooking = () => {
      fetchBookings(1);
    };

    window.addEventListener('admin:new-booking', onNewBooking);
    return () => window.removeEventListener('admin:new-booking', onNewBooking);
  }, [filters.status, filters.startDate, filters.endDate, filters.query]);

  const onSearchSubmit = (event) => {
    event.preventDefault();
    fetchBookings(1);
  };

  const onPageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    fetchBookings(nextPage);
  };

  return (
    <section className="mb-shell">
      <header className="mb-topbar">
        <form className="mb-top-search" onSubmit={onSearchSubmit}>
          <FiSearch size={14} />
          <input
            value={filters.query}
            onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
            placeholder="Search reservations..."
          />
        </form>

        <div className="mb-top-actions">
          <button type="button" aria-label="notifications"><FiBell size={14} /></button>
          <button type="button" aria-label="settings"><FiSettings size={14} /></button>
          <div className="mb-admin-chip">
            <strong>Admin Voyager</strong>
            <small>MASTER ACCESS</small>
          </div>
        </div>
      </header>

      <div className="mb-head">
        <div>
          <small>Operations</small>
          <h1>Manage Bookings</h1>
        </div>

        <div className="mb-head-actions">
          <Button variant="outlined" startIcon={<FiFilter size={14} />}>Filters</Button>
          <Button variant="contained" startIcon={<FiPlus size={14} />}>New Reservation</Button>
        </div>
      </div>

      <section className="mb-filter-cards">
        <article>
          <span>Date Range</span>
          <strong><FiCalendar size={13} /> {dateRangeLabel}</strong>
          <div className="mb-date-inline">
            <TextField
              type="date"
              size="small"
              value={filters.startDate}
              onChange={(event) => setFilters((prev) => ({ ...prev, startDate: event.target.value }))}
            />
            <TextField
              type="date"
              size="small"
              value={filters.endDate}
              onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value }))}
            />
          </div>
        </article>

        <article>
          <span>Status</span>
          <TextField
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
            select
            size="small"
            fullWidth
          >
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))}
          </TextField>
        </article>

        <article>
          <span>Occupancy</span>
          <strong>{summary.occupancy}% Capacity</strong>
          <p>{summary.activeBookings} active bookings</p>
        </article>

        <article className="mb-revenue-card">
          <span>Total Revenue</span>
          <strong>${Number(summary.totalRevenue || 0).toLocaleString()}</strong>
        </article>
      </section>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <div className="mb-loading"><CircularProgress /></div>
      ) : (
        <section className="mb-table-wrap">
          <table className="mb-table">
            <thead>
              <tr>
                <th>Guest Details</th>
                <th>Property / Suite</th>
                <th>Check In / Out</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const status = booking.status || 'PENDING';
                const statusLabel = status.charAt(0) + status.slice(1).toLowerCase();
                const guestName = [booking.user?.firstName, booking.user?.lastName].filter(Boolean).join(' ') || booking.user?.email;

                return (
                  <tr key={booking.id}>
                    <td>
                      <div className="mb-guest-cell">
                        <img src={booking.hotel?.photos?.[0] || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'} alt={guestName} />
                        <div>
                          <strong>{guestName}</strong>
                          <p>Member ID: #{booking.reservationNum}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <strong>{booking.hotel?.name || 'Unknown Hotel'}</strong>
                      <p>{booking.room?.type || 'Standard Room'}</p>
                    </td>
                    <td>
                      <strong>{formatDate(booking.checkInDate)}</strong>
                      <p>{formatDate(booking.checkOutDate)}</p>
                    </td>
                    <td>
                      <strong>${Number(booking.totalAmount || 0).toFixed(2)}</strong>
                      <p>via {booking.paymentMethod || 'Card'}</p>
                    </td>
                    <td>
                      <Chip
                        label={statusLabel}
                        size="small"
                        color={status === 'CONFIRMED' ? 'primary' : status === 'CANCELLED' ? 'error' : 'warning'}
                        variant="outlined"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <footer className="mb-table-foot">
            <p>Showing {bookings.length} of {pagination.total} reservations</p>
            <div className="mb-pagination">
              <button type="button" onClick={() => onPageChange(pagination.page - 1)}><FiChevronLeft size={14} /></button>
              <span>{pagination.page}</span>
              <button type="button" onClick={() => onPageChange(pagination.page + 1)}><FiChevronRight size={14} /></button>
            </div>
          </footer>
        </section>
      )}

      <section className="mb-bottom-cards">
        <article>
          <h3>{insights.reportTitle || 'Automated Guest Reports'}</h3>
          <p>{insights.reportSummary || 'Analytics insights are available for review.'}</p>
          <a href="#">{insights.reportLinkLabel || 'View Full Analysis'}</a>
        </article>

        <article className="vip">
          <small>{insights.vipTag || 'Elite Concierge'}</small>
          <h3>{insights.vipTitle || 'VIP Arrival'}</h3>
          <p>{insights.vipSummary || 'Prepare guest welcome package.'}</p>
        </article>
      </section>
    </section>
  );
}

export default AdminManageBookingsPage;
