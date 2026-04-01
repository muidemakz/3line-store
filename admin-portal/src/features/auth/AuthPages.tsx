import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isValid = isValidEmail(email.trim()) && password.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    navigate('/dashboard');
  };

  return (
    <div className="authBody">
      <main className="authPage" aria-label="Sign in">
        <section className="authCard" aria-label="Sign in form">
          <div className="authForm">
            <header className="authHeader">
              <h1 className="authTitle">Sign in</h1>
            </header>

            <form className="authFields authFields--compact" onSubmit={handleSubmit} noValidate>
              <label className="field">
                <span className="field__label">Email</span>
                <input
                  className="field__input"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="e.g. name@example.com"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </label>

              <div className="fieldGroup">
                <label className="field">
                  <span className="field__label">Password</span>
                  <input
                    className="field__input"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Enter Password Here"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </label>

                <Link className="authInlineLink" to="/forgot-password">Forgot Password?</Link>
              </div>

              <button className="authButton" type="submit" disabled={!isValid}>Sign In</button>
            </form>
          </div>
        </section>

        <footer className="authFooter" aria-label="Footer">
          <small className="authFooter__copy">Copyright &copy; 2026 3Line Store</small>
        </footer>
      </main>
    </div>
  );
};

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  
  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isValid = isValidEmail(email.trim());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    alert("If this email exists, you’ll receive a reset link shortly.");
    setEmail('');
  };

  return (
    <div className="authBody">
      <main className="authPage" aria-label="Forgot password">
        <section className="authCard" aria-label="Forgot password form">
          <div className="authForm">
            <header className="authHeader">
              <h1 className="authTitle">Forgot Password</h1>
            </header>

            <form className="authFields" onSubmit={handleSubmit} noValidate>
              <label className="field">
                <span className="field__label">Email</span>
                <input
                  className="field__input"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </label>

              <button className="authButton" type="submit" disabled={!isValid}>Submit</button>
            </form>

            <p className="authAlt" style={{ display: 'flex', gap: '4px' }}>
              <span>I remember my password?</span>
              <Link className="authAlt__link" to="/login">Sign In</Link>
            </p>
          </div>
        </section>

        <footer className="authFooter" aria-label="Footer">
          <small className="authFooter__copy">Copyright &copy; 2026 3Line Store</small>
        </footer>
      </main>
    </div>
  );
};
