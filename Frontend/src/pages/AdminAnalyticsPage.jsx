import { useEffect, useMemo, useState } from 'react';
import { Alert, CircularProgress } from '@mui/material';
import { FiBell, FiSettings, FiStar, FiTrendingUp, FiUserPlus, FiUsers } from 'react-icons/fi';
import { api } from '../lib/api';

function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState({
    summary: {
      monthlyRevenue: 0,
      occupancyRate: 0,
      newMembers: 0,
      avgGuestRating: 0,
    },
    revenuePerformance: [],
    topProperties: [],
    liveActivity: [],
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await api.get('/admin/analytics');
      setData(response?.data || data);
    } catch (err) {
      setError(err.message || 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    const onNewBooking = () => {
      fetchAnalytics();
    };

    window.addEventListener('admin:new-booking', onNewBooking);
    return () => window.removeEventListener('admin:new-booking', onNewBooking);
  }, []);

  const maxRevenue = useMemo(() => {
    return Math.max(...data.revenuePerformance.map((item) => item.projected || 0), 1);
  }, [data.revenuePerformance]);

  const userAcquisition = useMemo(() => {
    return Number(data.summary.userAcquisition || 0);
  }, [data.summary.userAcquisition]);

  const userAcquisitionPath = useMemo(() => {
    const trend = Array.isArray(data.acquisitionTrend) ? data.acquisitionTrend : [];

    if (!trend.length) {
      return 'M10 110 L350 110';
    }

    const width = 360;
    const height = 130;
    const paddingX = 10;
    const paddingY = 10;
    const chartWidth = width - paddingX * 2;
    const chartHeight = height - paddingY * 2;

    const maxValue = Math.max(...trend.map((point) => Number(point.value || 0)), 1);
    const stepX = trend.length > 1 ? chartWidth / (trend.length - 1) : 0;

    return trend
      .map((point, index) => {
        const x = paddingX + stepX * index;
        const rawValue = Number(point.value || 0);
        const normalized = Math.max(0, Math.min(1, rawValue / maxValue));
        const y = paddingY + chartHeight - normalized * chartHeight;
        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }, [data.acquisitionTrend]);

  return (
    <section className="an-shell">
      <header className="an-top">
        <h1>Analytics Overview</h1>
        <div className="an-search-actions">
          <label>
            <input placeholder="Search data..." />
          </label>
          <button type="button"><FiBell size={14} /></button>
          <button type="button"><FiSettings size={14} /></button>
        </div>
      </header>

      {error && <Alert severity="error">{error}</Alert>}

      {loading ? (
        <div className="an-loading"><CircularProgress /></div>
      ) : (
        <>
          <section className="an-kpis">
            <article>
              <div>
                <span><FiTrendingUp size={15} /></span>
                <small>{data.summary.revenueDeltaPercent >= 0 ? '+' : ''}{Number(data.summary.revenueDeltaPercent || 0).toFixed(1)}%</small>
              </div>
              <p>Monthly Revenue</p>
              <strong>${Number(data.summary.monthlyRevenue || 0).toLocaleString()}</strong>
            </article>
            <article>
              <div>
                <span><FiUsers size={15} /></span>
                <small>{data.summary.occupancyDeltaPercent >= 0 ? '+' : ''}{Number(data.summary.occupancyDeltaPercent || 0).toFixed(1)}%</small>
              </div>
              <p>Occupancy Rate</p>
              <strong>{data.summary.occupancyRate}%</strong>
            </article>
            <article>
              <div>
                <span><FiUserPlus size={15} /></span>
                <small>{data.summary.membersDeltaPercent >= 0 ? '+' : ''}{Number(data.summary.membersDeltaPercent || 0).toFixed(1)}%</small>
              </div>
              <p>New Members</p>
              <strong>{Number(data.summary.newMembers || 0).toLocaleString()}</strong>
            </article>
            <article>
              <div>
                <span><FiStar size={15} /></span>
                <small>{data.summary.ratingLabel || 'Stable'}</small>
              </div>
              <p>Avg. Guest Rating</p>
              <strong>{Number(data.summary.avgGuestRating || 0).toFixed(1)}/5</strong>
            </article>
          </section>

          <section className="an-mid-grid">
            <article className="an-card">
              <header>
                <h3>Revenue Performance</h3>
                <p>Annual projection vs. actual earnings</p>
              </header>
              <div className="an-bars">
                {data.revenuePerformance.map((item) => {
                  const projected = Math.max(8, Math.round((item.projected / maxRevenue) * 100));
                  const actual = Math.max(8, Math.round((item.actual / maxRevenue) * 100));
                  return (
                    <div className="an-bar-col" key={item.label}>
                      <div className="an-bar-bg" style={{ height: `${projected}%` }} />
                      <div className="an-bar-fg" style={{ height: `${actual}%` }} />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="an-card an-top-properties">
              <header>
                <h3>Top Properties</h3>
                <p>By occupancy demand</p>
              </header>
              <div>
                {data.topProperties.map((property) => (
                  <div className="an-property-row" key={property.hotelId}>
                    <img src={property.photo || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85'} alt={property.name} />
                    <div>
                      <strong>{property.name}</strong>
                      <div className="an-meter">
                        <span style={{ width: `${property.demandPercent}%` }} />
                      </div>
                    </div>
                    <small>{property.demandPercent}%</small>
                  </div>
                ))}
              </div>
              <button type="button">View Full Inventory</button>
            </article>
          </section>

          <section className="an-bottom-grid">
            <article className="an-acq-card">
              <h3>User Acquisition</h3>
              <p>Growth pattern over the last 30 days</p>
              <strong>+{userAcquisition.toLocaleString()} <span>Users</span></strong>
              <svg viewBox="0 0 360 130" aria-hidden="true">
                <path d={userAcquisitionPath} />
              </svg>
            </article>

            <article className="an-card an-live-card">
              <header>
                <h3>Live Activity</h3>
                <small>Live Now</small>
              </header>
              <div>
                {data.liveActivity.map((activity) => (
                  <div className="an-live-row" key={activity.id}>
                    <span />
                    <div>
                      <strong>{activity.title}</strong>
                      <p>{activity.subtitle}</p>
                    </div>
                    <small>{activity.time}</small>
                  </div>
                ))}
              </div>
            </article>
          </section>
        </>
      )}
    </section>
  );
}

export default AdminAnalyticsPage;
