import { useApp } from '../../context/AppContext'
import type { Page } from '../../types'
import styles from './Sidebar.module.css'

interface NavItem {
  page: Page
  label: string
  icon: React.ReactNode
  badgeKey?: 'cartCount'
}

const ShoppingBagIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
)

const HistoryIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
    <path d="M7 8h10" />
    <path d="M7 12h5" />
  </svg>
)

const SuggestIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 12V22H4V12" />
    <path d="M22 7H2v5h20V7Z" />
    <path d="M12 22V7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7Z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z" />
  </svg>
)

const ChevronRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
)

const NAV_ITEMS: NavItem[] = [
  { page: 'marketplace', label: 'Marketplace', icon: <ShoppingBagIcon /> },
  { page: 'cart', label: 'Cart', icon: <CartIcon />, badgeKey: 'cartCount' },
  { page: 'order-history', label: 'Order History', icon: <HistoryIcon /> },
  { page: 'suggestions', label: 'Item Suggestions', icon: <SuggestIcon /> },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { currentPage, setCurrentPage, cart, user, logout } = useApp()

  const cartCount = cart?.reduce((sum, i) => sum + i.quantity, 0) ?? 0
  const userName = user ? `${user.firstName} ${user.lastName}` : ''
  const userInitials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : '?'

  function handleNav(page: Page) {
    setCurrentPage(page)
    onClose?.()
  }

  // Line 72 — null-safe display name
  const displayName = (userName?.length ?? 0) > 12
    ? `${userName.substring(0, 10)}...`
    : userName ?? ''

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.logo}>
        <span className={styles.logoText}>3line Store</span>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close menu">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map(item => {
          const isActive = currentPage === item.page && item.page !== 'cart'
          const count = item.badgeKey === 'cartCount' ? cartCount : 0

          return (
            <button
              key={item.page}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              onClick={() => handleNav(item.page)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.label}</span>
              {count > 0 && (
                <span className={styles.badge}>{count}</span>
              )}
            </button>
          )
        })}
      </nav>

      <div className={styles.footer}>
        <button
          className={`${styles.userRow} ${currentPage === 'profile' ? styles.userRowActive : ''}`}
          onClick={() => setCurrentPage('profile')}
        >
          <div className={styles.avatar}>{userInitials}</div>
          <span className={styles.userName}>{displayName}</span>
          <span className={styles.chevronIcon}><ChevronRightIcon /></span>
        </button>
        <button className={styles.logoutBtn} onClick={logout}>
          Logout
        </button>
      </div>
    </aside>
  )
}
