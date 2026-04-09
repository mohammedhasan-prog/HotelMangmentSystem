import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
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
          {user?.role === 'ADMIN' && <NavLink to="/admin/manage-hotels">Admin Panel</NavLink>}
        </nav>

        <div className="nav-actions">
          {isAuthenticated ? (
            <>
              <span className="nav-user-pill">
                <FiUser size={13} />
                {user?.firstName || user?.email}
              </span>
              <Button className="nav-signout-btn" variant="outlined" color="inherit" startIcon={<FiLogOut />} onClick={handleLogout}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Button component={Link} to="/auth" className="nav-signin-btn" variant="text" color="inherit">Sign In</Button>
              <Button component={Link} to="/auth" className="nav-register-btn" variant="contained" color="primary">Register</Button>
              <Link to="/auth" className="nav-profile-btn" aria-label="Open account">
                <FiUser size={13} />
              </Link>
            </>
          )}
        </div>
      </header>

      <main className="page-body">{children}</main>
    </div>
  );
}

export default MainLayout;
