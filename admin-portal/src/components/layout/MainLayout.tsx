import React, { useState } from 'react';
import { useLocation, Outlet, Link } from 'react-router-dom';

// Import Legacy Assets
import dashboardIcon from '@/assets/sidebar-dashboard.svg';
import sessionsIcon from '@/assets/sidebar-sessions.svg';
import storeIcon from '@/assets/sidebar-store.svg';
import usersIcon from '@/assets/sidebar-users.svg';
import suggestionsIcon from '@/assets/sidebar-suggestions.svg';
import settingsIcon from '@/assets/sidebar-settings.svg';
import homeIcon from '@/assets/home-smile.svg';
import notificationBell from '@/assets/notification-bell.svg';
import notificationDot from '@/assets/notification-dot.svg';
import logoutIcon from '@/assets/logout.svg';
import chevronRight from '@/assets/chevron-right.svg';
import OnboardingModal from '@/features/onboarding/OnboardingModal';

import { useThemeStore } from '@/shared/store/theme.store';

export const MainLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [onboardingKey, setOnboardingKey] = useState(0);
  const { theme, toggleTheme } = useThemeStore();

  const location = useLocation();

  const menuItems = [
    { key: '/dashboard', icon: dashboardIcon, label: 'Dashboard' },
    { key: '/sessions', icon: sessionsIcon, label: 'Sessions' },
    { key: '/store', icon: storeIcon, label: 'Store' },
    { key: '/users', icon: usersIcon, label: 'Users' },
    { key: '/suggestions', icon: suggestionsIcon, label: 'Suggestions' },
    { key: '/settings', icon: settingsIcon, label: 'Settings' },
  ];

  const getPageTitle = (pathname: string) => {
    if (pathname === '/profile') return 'Profile';
    const item = menuItems.find(i => i.key === pathname);
    return item ? item.label : 'Admin Portal';
  };

  return (
    <div className="app">
      {/* Sidebar Backdrop for Mobile */}
      {mobileMenuOpen && (
        <div 
          className="sidebarBackdrop sidebarBackdrop--visible" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar__logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="sidebar__logoText">3line Store</div>
          <button 
            className="menuToggle" 
            style={{ border: 'none', background: 'transparent' }} 
            onClick={() => setMobileMenuOpen(false)}
          >
             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <nav className="sidebar__nav">
          {menuItems.map((item) => (
            <Link 
              key={item.key} 
              to={item.key} 
              className={`navItem ${location.pathname === item.key ? 'navItem--active' : ''}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              <img src={item.icon} alt="" className="navItem__icon" />
              <span className="navItem__label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar__footer">
          <div className="sidebar__divider" />
          <Link to="/profile" className="sidebar__user" onClick={() => setMobileMenuOpen(false)}>
            <div className="avatar">
              <div className="avatar__mask" />
              <div className="avatar__initials">OD</div>
            </div>
            <div className="userInfo">
              <div className="userInfo__name">Omiran Dam...</div>
              <div className="userInfo__role">SuperAdmin</div>
            </div>
          </Link>
          <Link 
            to="/login" 
            className="navItem navItem--danger"
            style={{ height: 'auto', padding: '12px 0' }}
          >
            <img src={logoutIcon} alt="" className="navItem__icon" />
            <span className="navItem__label">Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main">
        <header className="topHeader">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="menuToggle" onClick={() => setMobileMenuOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
            </button>
            <div className="breadcrumb">
              <div className="breadcrumb__start">
                <img src={homeIcon} alt="" className="breadcrumb__home" />
                <img src={chevronRight} alt="" className="breadcrumb__chev" style={{ width: 8, height: 8 }} />
              </div>
              <span className="breadcrumb__current">{getPageTitle(location.pathname)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="iconButton" onClick={toggleTheme} title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
               {theme === 'light' ? (
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon--dark-optimized"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
               ) : (
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon--dark-optimized"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
               )}
            </div>
            <div className="iconButton">
              <img src={notificationBell} alt="" className="iconButton__icon icon--dark-optimized" />
              <img src={notificationDot} alt="" className="iconButton__dot" />
            </div>
          </div>
        </header>

        <section className="panel">
          <div className="panel__content">
            <Outlet />
          </div>
        </section>
      </main>

      <OnboardingModal key={onboardingKey} onComplete={() => setOnboardingKey(prev => prev + 1)} />
    </div>
  );
};
