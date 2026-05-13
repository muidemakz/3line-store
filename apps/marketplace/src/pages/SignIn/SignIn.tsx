import React, { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { authService } from '../../shared/api/auth'
import styles from './SignIn.module.css'

export default function SignIn() {
  const { login } = useApp()
  const [view, setView] = useState<'signin' | 'forgot'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState(false)
  const [forgotError, setForgotError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      // Login successful - context will handle navigation
    } catch (err: any) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  const handleForgotSubmit = async () => {
    if (!forgotEmail.trim()) { setForgotError('Please enter your email.'); return }
    setIsLoading(true)
    setForgotError('')
    try {
      await authService.forgotPassword(forgotEmail.trim())
      setForgotSuccess(true)
    } catch (err: any) {
      setForgotError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (view === 'forgot') {
    return (
      <div className={styles.page}>
        <BlobBackground />
        <div className={styles.topBar}>
          <LogoMark />
          <a href="#" className={styles.getHelp}>Get Help</a>
        </div>
        <div className={styles.centerCol}>
          <WavyLine />
          <div className={styles.card}>
            <h1 className={styles.heading}>Forgot Password</h1>
            {forgotSuccess ? (
              <div style={{ textAlign: 'center' }}>
                <p style={{ color: '#16a34a', fontSize: '15px', marginBottom: '16px' }}>
                  ✅ Reset link sent! Check your email.
                </p>
                <button className={styles.textLink} onClick={() => { setView('signin'); setForgotSuccess(false); setForgotEmail('') }}>
                  Back to Sign In
                </button>
              </div>
            ) : (
              <>
                {forgotError && (
                  <div style={{ padding: '10px', marginBottom: '12px', backgroundColor: '#fee', color: '#c33', borderRadius: '8px', fontSize: '14px' }}>
                    {forgotError}
                  </div>
                )}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Email</label>
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="you@3line.com"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                  />
                </div>
                <button className={styles.submitBtn} onClick={handleForgotSubmit} disabled={isLoading}
                  style={{ opacity: isLoading ? 0.6 : 1 }}>
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <p className={styles.footerText}>
                  I remember my password?{' '}
                  <button className={styles.textLink} onClick={() => setView('signin')}>Sign In</button>
                </p>
              </>
            )}
          </div>
        </div>
        <BottomWelcome />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <BlobBackground />
      <div className={styles.topBar}>
        <LogoMark />
        <a href="#" className={styles.getHelp}>Get Help</a>
      </div>

      <div className={styles.centerCol}>
        <WavyLine />
        <div className={styles.card}>
          <h1 className={styles.heading}>Sign in</h1>

          {error && (
            <div style={{
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email</label>
            <input
              className={styles.input}
              type="email"
              placeholder="you@3line.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <div className={styles.passwordWrapper}>
              <input
                className={styles.input}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
              <button
                type="button"
                className={styles.showBtn}
                onClick={() => setShowPassword(v => !v)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div className={styles.rememberRow}>
            <label className={styles.rememberLabel}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
              />
              Remember me
            </label>
            <button type="button" className={styles.textLink} onClick={() => setView('forgot')}>
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.6 : 1 }}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
          </form>
        </div>
      </div>

      <BottomWelcome />
    </div>
  )
}

function LogoMark() {
  return (
    <div className={styles.logo}>
      <span className={styles.logoMain}>3line Store</span>
      <span className={styles.logoSub}>Employee</span>
    </div>
  )
}

function WavyLine() {
  return (
    <svg className={styles.wavy} viewBox="0 0 380 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0 18 C40 4, 80 32, 120 18 S200 4, 240 18 S320 32, 360 18 L380 18"
        stroke="#4A90D9"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M0 26 C40 12, 80 40, 120 26 S200 12, 240 26 S320 40, 360 26 L380 26"
        stroke="#2563EB"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
      />
    </svg>
  )
}

function BottomWelcome() {
  return (
    <div className={styles.bottomWelcome}>
      <span className={styles.welcomeTo}>Welcome to</span>
      <span className={styles.shopName}>3line Palliative Shop</span>
    </div>
  )
}

function BlobBackground() {
  return (
    <div className={styles.blobs} aria-hidden="true">
      {/* Large arc top-right */}
      <svg className={styles.blobTopRight} viewBox="0 0 500 500" fill="none">
        <circle cx="400" cy="50" r="320" fill="rgba(37,99,235,0.12)" />
      </svg>
      {/* Large arc bottom-left */}
      <svg className={styles.blobBottomLeft} viewBox="0 0 500 500" fill="none">
        <circle cx="100" cy="450" r="280" fill="rgba(29,78,216,0.1)" />
      </svg>
      {/* Floating gift top-left area */}
      <div className={styles.giftTopLeft}>
        <GiftBox size={56} rotation={-15} />
      </div>
      {/* Floating gift bottom-right area */}
      <div className={styles.giftBottomRight}>
        <GiftBox size={72} rotation={20} />
      </div>
      {/* Floating gift right side mid */}
      <div className={styles.giftMidRight}>
        <GiftBox size={44} rotation={-8} />
      </div>
      {/* Floating gift left side mid */}
      <div className={styles.giftMidLeft}>
        <GiftBox size={50} rotation={12} />
      </div>
    </div>
  )
}

function GiftBox({ size, rotation }: { size: number; rotation: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      style={{ transform: `rotate(${rotation}deg)`, opacity: 0.55 }}
    >
      {/* Box body */}
      <rect x="6" y="28" width="52" height="30" rx="3" fill="#2563EB" />
      {/* Lid */}
      <rect x="4" y="20" width="56" height="12" rx="3" fill="#1D4ED8" />
      {/* Ribbon vertical */}
      <rect x="28" y="20" width="8" height="38" fill="#60A5FA" />
      {/* Ribbon horizontal on lid */}
      <rect x="4" y="24" width="56" height="8" fill="#60A5FA" />
      {/* Bow left loop */}
      <ellipse cx="22" cy="18" rx="11" ry="8" fill="#93C5FD" transform="rotate(-20 22 18)" />
      {/* Bow right loop */}
      <ellipse cx="42" cy="18" rx="11" ry="8" fill="#93C5FD" transform="rotate(20 42 18)" />
      {/* Bow center */}
      <circle cx="32" cy="20" r="5" fill="#BFDBFE" />
    </svg>
  )
}
