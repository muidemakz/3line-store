import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import ChangePasswordModal from '../../components/ChangePasswordModal/ChangePasswordModal'
import styles from './Profile.module.css'

const KeyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
  </svg>
)

const LogoutIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
)

export default function Profile() {
  const { user, currentSessionPoints, activeSession, userPoints, setCurrentPage, logout } = useApp()
  const [changePasswordOpen, setChangePasswordOpen] = useState(false)

  const userName = user ? `${user.firstName} ${user.lastName}` : ''
  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '?'
  const outOfPoints = currentSessionPoints <= 0

  return (
    <div className={styles.page}>
      {/* User header row */}
      <div className={styles.userRow}>
        <div className={styles.userLeft}>
          <div className={styles.avatar}>{userInitials}</div>
          <span className={styles.userName}>{userName}</span>
          <span className={styles.levelBadge}>{user?.role ?? 'USER'}</span>
        </div>
        <button className={styles.logoutBtn} onClick={logout}>
          <LogoutIcon />
          Logout
        </button>
      </div>

      {/* Points banner */}
      <div className={styles.pointsBanner}>
        <div className={styles.pointsBannerLeft}>
          <div className={styles.bannerPtsRow}>
            <span className={styles.bannerPtsNumber}>{currentSessionPoints}</span>
            <span className={styles.bannerPtsSuffix}>PTS</span>
            <span className={styles.bannerPtsLabel}>&nbsp; Points Balance</span>
          </div>
          {outOfPoints && (
            <p className={styles.outOfPointsText}>You've run out of points to shop with.</p>
          )}
        </div>
        <button
          className={styles.suggestItemsBtn}
          onClick={() => setCurrentPage('suggestions')}
        >
          Suggest Items
        </button>
      </div>

      {/* Personal Information */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Personal Information</h2>
        <div className={styles.infoTable}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{user?.email ?? '—'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>User Type</span>
            <span className={styles.infoValue}>{user?.role ?? '—'}</span>
          </div>
          <div className={styles.infoRowLast}>
            <span className={styles.infoLabel}>PT Per Session</span>
            <span className={styles.infoValue}>
              {userPoints.find(p => p.sessionId === activeSession?.id)?.allocatedPoints != null
                ? `${userPoints.find(p => p.sessionId === activeSession?.id)!.allocatedPoints} PTS`
                : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Settings</h2>
        <div className={styles.infoTable}>
          <div className={styles.infoRowLast}>
            <div className={styles.passwordLeft}>
              <span className={styles.infoLabel}>Password</span>
              <span className={styles.passwordSub}>Update or Reset your password</span>
            </div>
            <button
              className={styles.changePasswordBtn}
              onClick={() => setChangePasswordOpen(true)}
            >
              <KeyIcon />
              Change Password
            </button>
          </div>
        </div>
      </div>

      {changePasswordOpen && (
        <ChangePasswordModal onClose={() => setChangePasswordOpen(false)} />
      )}
    </div>
  )
}
