import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button, Chip, Stack } from '@mui/material';
import { FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

function MainLayout({ children }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="site-shell">
      <header className="top-nav">
        <Link to="/" className="brand">The Elevated Voyager</Link>

        <nav className="nav-links">
          <NavLink to="/" end>Hotels</NavLink>
          <NavLink to="/dashboard">Bookings</NavLink>
          <a href="#hp-footer">Help</a>
          {user?.role === 'ADMIN' && <NavLink to="/admin">Admin Panel</NavLink>}
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip icon={<FiUser size={14} />} label={user?.firstName || user?.email} color="primary" variant="outlined" />
              <Button variant="outlined" color="inherit" startIcon={<FiLogOut />} onClick={handleLogout}>Sign Out</Button>
            </Stack>
          ) : (
            <Stack direction="row" spacing={1} alignItems="center">
              <Button component={Link} to="/auth" variant="text" color="inherit">Sign In</Button>
              <Button component={Link} to="/auth" variant="contained" color="primary">Register</Button>
            </Stack>
          )}
        </div>
      </header>

      <main className="page-body">{children}</main>
    </div>
  );
}

export default MainLayout;
