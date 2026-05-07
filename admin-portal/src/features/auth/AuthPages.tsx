import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button } from 'antd';
import { useThemeStore } from '@/shared/store/theme.store';
import styles from './AuthPages.module.css';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { theme: _theme } = useThemeStore();

  const onFinish = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('isAuthenticated', 'true');
      navigate('/dashboard');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="authBody">
      <main className="authPage">
        <section className="authCard">
          <div className="authForm">
            <header className="authHeader">
              <h1 className="authTitle">Sign in</h1>
            </header>

            <Form
              name="login"
              onFinish={onFinish}
              layout="vertical"
              className="authFields authFields--compact"
            >
              <Form.Item
                label={<span className="field__label">Email</span>}
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input placeholder="e.g. name@example.com" className="field__input" />
              </Form.Item>

              <div className="fieldGroup">
                <Form.Item
                  label={<span className="field__label">Password</span>}
                  name="password"
                  rules={[{ required: true, message: 'Please input your password!' }]}
                  style={{ marginBottom: 0 }}
                >
                  <Input.Password placeholder="Enter Password Here" className="field__input" />
                </Form.Item>
                <Link className="authInlineLink" to="/forgot-password">
                  Forgot Password?
                </Link>
              </div>

              <div className={styles.formActions}>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    className="authButton"
                  >
                    Sign In
                  </Button>
                </Form.Item>
              </div>
            </Form>
          </div>
        </section>

        <footer className="authFooter">
          <small className="authFooter__copy">Copyright &copy; 2026 3line Store</small>
        </footer>
      </main>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onFinish = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
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
                <p className={styles.successTitle}>Check your email</p>
                <p className={styles.successDesc}>
                  If an account with that email exists, we've sent a password reset link. Check your inbox (and spam folder, just in case).
                </p>
                <Link className={styles.successBack} to="/login">
                  Back to Sign In
                </Link>
              </div>
            ) : (
              <>
                <header className="authHeader">
                  <h1 className="authTitle">Forgot Password</h1>
                </header>

                <Form
                  name="forgot-password"
                  onFinish={onFinish}
                  layout="vertical"
                  className="authFields"
                >
                  <Form.Item
                    label={<span className="field__label">Email</span>}
                    name="email"
                    rules={[
                      { required: true, message: 'Please input your email!' },
                      { type: 'email', message: 'Please enter a valid email!' },
                    ]}
                  >
                    <Input placeholder="e.g. name@example.com" className="field__input" />
                  </Form.Item>

                  <div className={styles.formActions}>
                    <Form.Item>
                      <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        className="authButton"
                      >
                        Send Reset Link
                      </Button>
                    </Form.Item>
                  </div>
                </Form>

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
