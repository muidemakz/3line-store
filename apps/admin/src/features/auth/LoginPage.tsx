import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { axiosInstance } from '@/shared/api/axios';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.post('/auth/login', { email, password });
      const payload = res.data?.data ?? res.data;
      const user = payload.user;
      const tokens = payload.tokens;

      if (!user || !tokens) {
        setError('Unexpected response from server. Please try again.');
        return;
      }

      if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
        setError('Access denied. Admin account required.');
        return;
      }

      localStorage.setItem('auth_token', tokens.accessToken);
      localStorage.setItem('admin_user', JSON.stringify(user));

      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg =
        err.response?.data?.message ??
        err.message ??
        'Login failed. Check your credentials and try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'grid',
      placeItems: 'center',
      padding: '16px',
    }}>
      <main style={{ width: '100%', maxWidth: '480px' }}>
        <section style={{
          background: 'var(--white)',
          padding: '40px',
          borderRadius: '16px',
          boxShadow: '-16px 16px 1px rgba(0,1,44,0.03)',
        }}>
          <h1 style={{
            fontFamily: 'var(--font-title)',
            fontSize: '28px',
            fontWeight: 700,
            color: 'var(--text-900)',
            margin: '0 0 28px',
            textAlign: 'center',
          }}>
            Admin Sign In
          </h1>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: 'rgba(217,45,32,0.06)',
              border: '1px solid rgba(217,45,32,0.25)',
              borderRadius: '8px',
              color: '#b91c1c',
              fontSize: '14px',
              marginBottom: '20px',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-900)' }}>
                Email
              </label>
              <input
                type="email"
                className="field__input"
                placeholder="admin@palliative.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                style={{
                  padding: '10px 14px',
                  border: '1.5px solid var(--gray-200)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'var(--white)',
                  color: 'var(--text-900)',
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-900)' }}>
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  style={{ fontSize: '13px', color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}
                >
                  Forgot Password?
                </Link>
              </div>
              <input
                type="password"
                className="field__input"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{
                  padding: '10px 14px',
                  border: '1.5px solid var(--gray-200)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'var(--white)',
                  color: 'var(--text-900)',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="authButton"
              style={{ marginTop: '8px' }}
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </section>

        <footer style={{ marginTop: '24px', textAlign: 'center' }}>
          <small style={{ color: 'var(--text-400)', fontSize: '13px' }}>
            Copyright © 2026 3Line Store
          </small>
        </footer>
      </main>
    </div>
  );
};

export default LoginPage;
