import React, { useState } from 'react';
import { useLocation, Outlet, Link, Navigate } from 'react-router-dom';

// Import Legacy Assets
import dashboardIcon from '@/assets/sidebar-dashboard.svg';
import sessionsIcon from '@/assets/sidebar-sessions.svg';
import storeIcon from '@/assets/sidebar-store.svg';
import usersIcon from '@/assets/sidebar-users.svg';
import suggestionsIcon from '@/assets/sidebar-suggestions.svg';
import settingsIcon from '@/assets/sidebar-settings.svg';
import notificationBell from '@/assets/notification-bell.svg';
import notificationDot from '@/assets/notification-dot.svg';
import logoutIcon from '@/assets/logout.svg';
import OnboardingModal from '@/features/onboarding/OnboardingModal';

import { useThemeStore } from '@/shared/store/theme.store';

export const MainLayout: React.FC = () => {
  // ── All hooks must come first (Rules of Hooks) ────────────
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [onboardingKey, setOnboardingKey] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const location = useLocation();

  // ── Auth guard (after all hooks) ──────────────────────────
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const adminUser = (() => {
    try { return JSON.parse(localStorage.getItem('admin_user') ?? '{}'); } catch { return {}; }
  })();
  const displayName = adminUser.firstName
    ? `${adminUser.firstName} ${adminUser.lastName ?? ''}`.trim()
    : 'Admin';
  const initials = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('admin_user');
  };


  const menuItems = [
    { key: '/dashboard', icon: dashboardIcon, label: 'Dashboard' },
    { key: '/sessions', icon: sessionsIcon, label: 'Sessions' },
    { key: '/store', icon: storeIcon, label: 'Store' },
    { key: '/users', icon: usersIcon, label: 'Users' },
    { key: '/suggestions', icon: suggestionsIcon, label: 'Suggestions' },
    { key: '/settings', icon: settingsIcon, label: 'Settings' },
  ];

  const getBreadcrumbs = (): { label: string; path?: string }[] => {
    const { pathname } = location;
    if (/^\/sessions\/[^/]+$/.test(pathname))
      return [{ label: 'Sessions', path: '/sessions' }, { label: 'Session Details' }];
    if (pathname === '/orders')
      return [{ label: 'Orders' }];
    if (/^\/orders\/[^/]+$/.test(pathname))
      return [{ label: 'Orders', path: '/orders' }, { label: 'Order Details' }];
    const label = menuItems.find(i => i.key === pathname)?.label
      ?? (pathname === '/profile' ? 'Profile' : 'Admin Portal');
    return [{ label }];
  };

  const breadcrumbs = getBreadcrumbs();

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
              <div className="avatar__initials">{initials}</div>
            </div>
            <div className="userInfo">
              <div className="userInfo__name">{displayName.length > 14 ? displayName.slice(0, 13) + '…' : displayName}</div>
              <div className="userInfo__role">{adminUser.role ?? 'Admin'}</div>
            </div>
          </Link>
          <Link
            to="/login"
            className="navItem navItem--danger"
            style={{ height: 'auto', padding: '12px 0' }}
            onClick={handleLogout}
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
            <nav className="breadcrumb" aria-label="breadcrumb">
              {breadcrumbs.map((crumb, i) => {
                const isLast = i === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={crumb.label}>
                    {i > 0 && (
                      <svg className="breadcrumb__chev" viewBox="0 0 6 10" fill="none" aria-hidden="true">
                        <path d="M1 1l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                    {isLast ? (
                      <span className="breadcrumb__current">{crumb.label}</span>
                    ) : (
                      <Link to={crumb.path!} className="breadcrumb__ancestor">{crumb.label}</Link>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="iconButton" onClick={toggleTheme} title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}>
               {theme === 'light' ? (
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon--dark-optimized"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
               ) : (
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon--dark-optimized"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
               )}
            </div>
            <div style={{ position: 'relative' }}>
              <div className="iconButton" onClick={() => setNotifOpen(v => !v)} title="Notifications">
                <img src={notificationBell} alt="" className="iconButton__icon icon--dark-optimized" />
                <img src={notificationDot} alt="" className="iconButton__dot" />
              </div>

              {notifOpen && (
                <>
                  {/* Click-outside backdrop */}
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 100 }}
                    onClick={() => setNotifOpen(false)}
                  />
                  {/* Panel */}
                  <div style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: 320,
                    background: 'var(--white)',
                    border: '1px solid var(--gray-200)',
                    borderRadius: 12,
                    boxShadow: 'var(--shadow-panel)',
                    zIndex: 101,
                    overflow: 'hidden',
                    animation: 'notifSlideDown 0.18s ease',
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '16px 20px',
                      borderBottom: '1px solid var(--gray-200)',
                    }}>
                      <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-900)' }}>Notifications</span>
                      <button
                        onClick={() => setNotifOpen(false)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-400)', padding: 4, lineHeight: 1 }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-400)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 12 }}>
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                      </svg>
                      <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-900)' }}>No new notifications</p>
                      <p style={{ margin: '4px 0 0', fontSize: 13, color: 'var(--text-400)' }}>You're all caught up!</p>
                    </div>
                  </div>
                </>
              )}
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
