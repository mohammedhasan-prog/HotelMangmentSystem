import { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, CardContent, TextField } from '@mui/material';
import { FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, logout, loading, isAuthenticated, user } = useAuth();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const isAdminSession = useMemo(() => user?.role === 'ADMIN', [user]);

  if (isAuthenticated && isAdminSession) {
    return <Navigate to="/admin/manage-hotels" replace />;
  }

  const onChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const loggedUser = await login(form.email, form.password);

      if (loggedUser?.role !== 'ADMIN') {
        logout();
        setError('This login is only for admin accounts.');
        return;
      }

      navigate('/admin/manage-hotels');
    } catch (err) {
      setError(err.message || 'Login failed.');
    }
  };

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-brand">
        <h2>The Elevated Voyager</h2>
        <p>Hospitality-first booking</p>
      </div>

      <Card className="admin-login-card elevated">
        <CardContent>
          <h1>Admin login</h1>
          <p>Sign in to manage hotels, rooms, and inventory.</p>

          <form className="admin-login-form" onSubmit={onSubmit}>
            <label htmlFor="admin-email">Email</label>
            <TextField
              id="admin-email"
              value={form.email}
              onChange={onChange('email')}
              placeholder="admin@hotelbooker.com"
              type="email"
              fullWidth
              required
            />

            <div className="admin-password-head">
              <label htmlFor="admin-password">Password</label>
              <Link to="/auth">User login</Link>
            </div>

            <div className="admin-password-field">
              <TextField
                id="admin-password"
                value={form.password}
                onChange={onChange('password')}
                placeholder="Enter password"
                type={showPassword ? 'text' : 'password'}
                fullWidth
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label="Toggle password visibility"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </button>
            </div>

            {error && <Alert severity="error">{error}</Alert>}

            <Button type="submit" variant="contained" color="primary" endIcon={<FiArrowRight />} disabled={loading} fullWidth>
              {loading ? 'Signing in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminLoginPage;
