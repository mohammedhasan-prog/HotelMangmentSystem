import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, CardContent, TextField } from '@mui/material';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

function AuthPage() {
  const navigate = useNavigate();
  const { login, register, loading } = useAuth();
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register(form);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-branding">
        <h2>The Elevated Voyager</h2>
        <p>HOSPITALITY-FIRST BOOKING</p>
      </div>

      <Card className="auth-card elevated" component={motion.div} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <CardContent>
        <h1>{mode === 'login' ? 'Login to StayVue' : 'Create your StayVue account'}</h1>
        <p>{mode === 'login' ? 'Welcome back. Please enter your details.' : 'Join now to start your curated journey.'}</p>

        <div className="mode-toggle">
          <Button
            className={mode === 'login' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setMode('login')}
            type="button"
            variant={mode === 'login' ? 'contained' : 'outlined'}
            color="primary"
          >
            Login
          </Button>
          <Button
            className={mode === 'register' ? 'tab-btn active' : 'tab-btn'}
            onClick={() => setMode('register')}
            type="button"
            variant={mode === 'register' ? 'contained' : 'outlined'}
            color="primary"
          >
            Register
          </Button>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          {mode === 'register' && (
            <>
              <TextField label="First name" placeholder="First name" value={form.firstName} onChange={update('firstName')} required fullWidth />
              <TextField label="Last name" placeholder="Last name" value={form.lastName} onChange={update('lastName')} required fullWidth />
            </>
          )}
          <TextField type="email" label="Email" placeholder="Email" value={form.email} onChange={update('email')} required fullWidth />
          <TextField type="password" label="Password" placeholder="Password" value={form.password} onChange={update('password')} required fullWidth />

          {error && <div className="error-text">{error}</div>}

          <Button variant="contained" color="primary" type="submit" disabled={loading} fullWidth>
            {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
          </Button>
        </form>

        <div className="auth-footer-note">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Sign up' : 'Login'}
          </button>
        </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default AuthPage;
