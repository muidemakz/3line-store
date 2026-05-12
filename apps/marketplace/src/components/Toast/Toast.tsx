import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import styles from './Toast.module.css'

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
)

const InfoIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

const ErrorIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
)

export default function Toast() {
  const { toast } = useApp()
  const [visible, setVisible] = useState(false)
  const [currentToast, setCurrentToast] = useState(toast)

  useEffect(() => {
    if (toast) {
      setCurrentToast(toast)
      setVisible(true)
    } else {
      // Fade out first, then remove
      setVisible(false)
      const t = setTimeout(() => setCurrentToast(null), 400)
      return () => clearTimeout(t)
    }
  }, [toast])

  if (!currentToast) return null

  const icons = {
    success: <CheckIcon />,
    info: <InfoIcon />,
    error: <ErrorIcon />,
  }

  return (
    <div className={`${styles.toast} ${styles[currentToast.type]} ${visible ? styles.show : styles.hide}`}>
      <span className={styles.icon}>{icons[currentToast.type]}</span>
      <span className={styles.message}>{currentToast.message}</span>
    </div>
  )
}
