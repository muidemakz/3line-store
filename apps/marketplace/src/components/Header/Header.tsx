import { useState, useRef, useEffect } from 'react'
import { useApp } from '../../context/AppContext'
import styles from './Header.module.css'

const PAGE_LABELS: Record<string, string> = {
  marketplace: 'Marketplace',
  cart: 'Cart',
  'order-history': 'Order History',
  suggestions: 'Item Suggestions',
  profile: 'Profile & Settings',
}

const HomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const ChevronDownIcon = () => (
  <svg className={styles.sessionChevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

interface HeaderProps {
  onMenuOpen?: () => void
}

export default function Header({ onMenuOpen }: HeaderProps) {
  const { currentPage, currentSessionPoints, cart, sessions, activeSession, userPoints, switchSession, setCurrentPage } = useApp()
  const cartCount = cart?.reduce((sum, i) => sum + i.quantity, 0) ?? 0
  const [sessionOpen, setSessionOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setSessionOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className={styles.header}>
      {/* Hamburger — only visible on mobile */}
      <button className={styles.hamburger} onClick={onMenuOpen} aria-label="Open menu">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      <div className={styles.breadcrumb}>
        <span className={styles.breadcrumbHome}>
          <HomeIcon />
          Home
        </span>
        <span className={styles.breadcrumbSep}>/</span>
        <span className={styles.breadcrumbCurrent}>{PAGE_LABELS[currentPage] ?? 'Marketplace'}</span>
      </div>

      <div className={styles.right}>
        {/* Combined outer pill: session selector wrapping inner points pill */}
        <div className={styles.sessionDropdownWrapper} ref={dropdownRef}>
          <div className={styles.outerPill} onClick={() => setSessionOpen(v => !v)}>
            <span className={styles.sessionLabel}>
              {activeSession?.label || activeSession?.name || 'No Session'}
              <ChevronDownIcon />
            </span>

            {/* Inner dark navy gradient pill */}
            <div className={styles.innerPill}>
              <div className={styles.pointsRow}>
                <span className={styles.pointsNumber}>{currentSessionPoints}</span>
                <span className={styles.ptsSuffix}>PTS</span>
                <span className={styles.pointsLabel}>&nbsp; Points Balance</span>
              </div>
              <div className={styles.daysLeftBadge}>
                <span>⏰</span>
                {(activeSession as any)?.daysLeft ?? '—'} Days Left
              </div>
            </div>
          </div>

          {sessionOpen && (
            <div className={styles.sessionDropdown}>
              {sessions?.length > 0 && sessions.map(s => {
                const pts = userPoints.find(p => p.sessionId === s.id)?.remainingPoints ?? 0;
                return (
                  <button
                    key={s.id}
                    className={`${styles.sessionOption} ${s.id === activeSession?.id ? styles.selected : ''}`}
                    onClick={(e) => { e.stopPropagation(); switchSession(s.id); setSessionOpen(false) }}
                  >
                    <span className={styles.sessionOptionName}>{(s as any).label || s.name}</span>
                    <span className={styles.sessionOptionPts}>{pts} PTS</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart icon */}
        <button className={styles.cartBtn} onClick={() => setCurrentPage('cart')}>
          <CartIcon />
          {cartCount > 0 && <span className={styles.cartBadge}>{cartCount}</span>}
        </button>
      </div>
    </header>
  )
}
