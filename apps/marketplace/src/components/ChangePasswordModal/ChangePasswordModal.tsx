import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import styles from './ChangePasswordModal.module.css'

interface Props {
  onClose: () => void
}

const EyeIcon = ({ open }: { open: boolean }) => open ? (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
) : (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
)

const ClipboardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="4" rx="1" />
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <path d="M12 11h4" />
    <path d="M12 16h4" />
    <path d="M8 11h.01" />
    <path d="M8 16h.01" />
  </svg>
)

const InfoIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc6803" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
)

export default function ChangePasswordModal({ onClose }: Props) {
  const { logout } = useApp()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [oldPasswordError, setOldPasswordError] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const canSubmit = oldPassword.length > 0 && newPassword.length > 0 && confirmPassword.length > 0

  function handleSubmit() {
    if (!canSubmit) return
    // Simulate incorrect old password for demo: any password < 8 chars is "wrong"
    if (oldPassword.length < 8) {
      setOldPasswordError('Password is incorrect')
      return
    }
    setOldPasswordError('')
    setSubmitted(true)
    // Log out after brief delay (Figma: "You'll be logged out")
    setTimeout(() => {
      onClose()
      logout()
    }, 1200)
  }

  if (submitted) {
    return (
      <div className={styles.overlay} onClick={onClose}>
        <div className={styles.successToast}>
          <span className={styles.successIcon}>✓</span>
          Submitted Successfully
          <button className={styles.toastClose} onClick={onClose}>×</button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Title */}
        <div className={styles.titleRow}>
          <span className={styles.titleIcon}><ClipboardIcon /></span>
          <div>
            <h2 className={styles.title}>Change Password</h2>
            <p className={styles.subtitle}>Provide the old and new password below.</p>
          </div>
        </div>

        {/* Old Password */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Old Password</label>
          <div className={`${styles.inputWrapper} ${oldPasswordError ? styles.inputError : ''}`}>
            <input
              className={styles.input}
              type={showOld ? 'text' : 'password'}
              value={oldPassword}
              onChange={e => { setOldPassword(e.target.value); setOldPasswordError('') }}
              placeholder="••••••••"
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowOld(v => !v)}>
              <EyeIcon open={showOld} />
            </button>
          </div>
          {oldPasswordError && <p className={styles.errorText}>{oldPasswordError}</p>}
        </div>

        {/* New Password */}
        <div className={styles.formGroup}>
          <label className={styles.label}>New Password</label>
          <div className={styles.inputWrapper}>
            <input
              className={styles.input}
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowNew(v => !v)}>
              <EyeIcon open={showNew} />
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className={styles.formGroup}>
          <label className={styles.label}>Confirm New Password</label>
          <div className={styles.inputWrapper}>
            <input
              className={styles.input}
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowConfirm(v => !v)}>
              <EyeIcon open={showConfirm} />
            </button>
          </div>
        </div>

        {/* Warning banner */}
        <div className={styles.warningBanner}>
          <InfoIcon />
          <p className={styles.warningText}>
            You'll be logged out and need to sign in again using your new password.
          </p>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button
            className={`${styles.submitBtn} ${canSubmit ? styles.submitActive : ''}`}
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  )
}
