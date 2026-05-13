import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { axiosInstance } from '@/shared/api/axios';
import styles from './AuthPages.module.css';

// ─── Forgot Password ──────────────────────────────────────
export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // When SMTP is not configured, backend returns the raw token
  const [manualToken, setManualToken] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      const data = res.data?.data ?? {};
      // emailSent: false means SMTP not set up — show manual token
      if (data.emailSent === false && data.resetToken) {
        setManualToken(data.resetToken);
      }
      setSent(true);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authBody">
      <main className="authPage">
        <section className="authCard">
          <div className="authForm">
            {sent ? (
              <div className={styles.successWrap}>
                <div className={styles.successIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                {manualToken ? (
                  <>
                    <p className={styles.successTitle}>SMTP not configured</p>
                    <p className={styles.successDesc}>
                      Email delivery is not set up. Copy this reset link and open it in the browser:
                    </p>
                    <div style={{
                      background: 'var(--gray-50)',
                      border: '1px solid var(--gray-200)',
                      borderRadius: 8,
                      padding: '10px 14px',
                      fontSize: 13,
                      wordBreak: 'break-all',
                      marginBottom: 12,
                      color: 'var(--text-900)',
                      fontFamily: 'monospace',
                    }}>
                      {window.location.origin}/reset-password?token={manualToken}
                    </div>
                    <button
                      className="authButton"
                      type="button"
                      style={{ width: '100%', marginBottom: 12 }}
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/reset-password?token=${manualToken}`);
                      }}
                    >
                      Copy Reset Link
                    </button>
                  </>
                ) : (
                  <>
                    <p className={styles.successTitle}>Check your email</p>
                    <p className={styles.successDesc}>
                      If an account with that email exists, we've sent a password reset link. Check your inbox (and spam folder, just in case).
                    </p>
                  </>
                )}
                <Link className={styles.successBack} to="/login">
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <>
                <header className="authHeader">
                  <h1 className="authTitle">Forgot Password</h1>
                </header>

                {error && (
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(217,45,32,0.06)',
                    border: '1px solid rgba(217,45,32,0.25)',
                    borderRadius: 8,
                    color: '#b91c1c',
                    fontSize: 14,
                    marginBottom: 20,
                  }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="authFields">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="field__label">Email</label>
                    <input
                      type="email"
                      className="field__input"
                      placeholder="e.g. admin@palliative.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="authButton"
                    style={{ marginTop: 8, width: '100%' }}
                  >
                    {loading ? 'Sending…' : 'Send Reset Link'}
                  </button>
                </form>

                <p className="authAlt">
                  <span>I remember my password?</span>
                  <Link className="authAlt__link" to="/login">Sign In</Link>
                </p>
              </>
            )}
          </div>
        </section>

        <footer className="authFooter">
          <small className="authFooter__copy">Copyright &copy; 2026 3line Store</small>
        </footer>
      </main>
    </div>
  );
};

// ─── Reset Password ───────────────────────────────────────
export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError(null);
    try {
      await axiosInstance.post('/auth/reset-password', { token, password, confirmPassword: confirm });
      setDone(true);
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="authBody">
        <main className="authPage">
          <section className="authCard">
            <div className="authForm">
              <p style={{ textAlign: 'center', color: 'var(--text-600)' }}>
                Invalid reset link. <Link to="/forgot-password" className="authAlt__link">Request a new one.</Link>
              </p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="authBody">
      <main className="authPage">
        <section className="authCard">
          <div className="authForm">
            {done ? (
              <div className={styles.successWrap}>
                <div className={styles.successIcon}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className={styles.successTitle}>Password updated!</p>
                <p className={styles.successDesc}>Your password has been changed. You can now sign in with your new password.</p>
                <Link className={styles.successBack} to="/login">Go to Sign In</Link>
              </div>
            ) : (
              <>
                <header className="authHeader">
                  <h1 className="authTitle">Reset Password</h1>
                </header>

                {error && (
                  <div style={{
                    padding: '12px 16px',
                    background: 'rgba(217,45,32,0.06)',
                    border: '1px solid rgba(217,45,32,0.25)',
                    borderRadius: 8,
                    color: '#b91c1c',
                    fontSize: 14,
                    marginBottom: 20,
                  }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="authFields">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="field__label">New Password</label>
                    <input
                      type="password"
                      className="field__input"
                      placeholder="Min 8 chars, upper, lower, number, symbol"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label className="field__label">Confirm Password</label>
                    <input
                      type="password"
                      className="field__input"
                      placeholder="Repeat your new password"
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="authButton"
                    style={{ marginTop: 8, width: '100%' }}
                  >
                    {loading ? 'Saving…' : 'Set New Password'}
                  </button>
                </form>
              </>
            )}
          </div>
        </section>

        <footer className="authFooter">
          <small className="authFooter__copy">Copyright &copy; 2026 3line Store</small>
        </footer>
      </main>
    </div>
  );
};
