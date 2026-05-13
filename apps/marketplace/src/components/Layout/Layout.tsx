import { useState, useEffect } from 'react'
import Sidebar from '../Sidebar/Sidebar'
import Header from '../Header/Header'
import Marketplace from '../../pages/Marketplace/Marketplace'
import OrderHistory from '../../pages/OrderHistory/OrderHistory'
import Suggestions from '../../pages/Suggestions/Suggestions'
import Profile from '../../pages/Profile/Profile'
import CartDrawer from '../CartDrawer/CartDrawer'
import WelcomeModal from '../WelcomeModal/WelcomeModal'
import Toast from '../Toast/Toast'
import { useApp } from '../../context/AppContext'
import styles from './Layout.module.css'

export default function Layout() {
  const { currentPage } = useApp()
  const [navOpen, setNavOpen] = useState(false)

  // Auto-close nav when page changes (mobile UX)
  useEffect(() => { setNavOpen(false) }, [currentPage])

  return (
    <div className={styles.shell}>
      {/* Mobile backdrop */}
      {navOpen && (
        <div className={styles.backdrop} onClick={() => setNavOpen(false)} />
      )}
      <Sidebar isOpen={navOpen} onClose={() => setNavOpen(false)} />
      <div className={styles.main}>
        <Header onMenuOpen={() => setNavOpen(true)} />
        <div className={styles.content}>
          {currentPage === 'marketplace' && <Marketplace />}
          {currentPage === 'order-history' && <OrderHistory />}
          {currentPage === 'suggestions' && <Suggestions />}
          {currentPage === 'profile' && <Profile />}
        </div>
      </div>
      <CartDrawer />
      <WelcomeModal />
      <Toast />
    </div>
  )
}
