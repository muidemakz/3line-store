import {
  AppstoreOutlined,
  CommentOutlined,
  HomeOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  UserOutlined
} from '@ant-design/icons';
import { NavLink, Outlet } from 'react-router-dom';
import { AppTypography } from '@/components/ui/AppTypography';

const nav = [
  { to: '/dashboard', label: 'Home', short: 'Home', icon: <HomeOutlined className="main-layout__nav-icon" /> },
  { to: '/store', label: 'Store', short: 'Store', icon: <AppstoreOutlined className="main-layout__nav-icon" /> },
  { to: '/cart', label: 'Cart', short: 'Cart', icon: <ShoppingCartOutlined className="main-layout__nav-icon" /> },
  { to: '/orders', label: 'Orders', short: 'Orders', icon: <ShoppingOutlined className="main-layout__nav-icon" /> },
  {
    to: '/suggestions',
    label: 'Suggestions',
    short: 'Ideas',
    icon: <CommentOutlined className="main-layout__nav-icon" />
  },
  { to: '/profile', label: 'Profile', short: 'Me', icon: <UserOutlined className="main-layout__nav-icon" /> }
];

export function MainLayout() {
  return (
    <div className="main-layout">
      <header className="main-layout__header">
        <div className="main-layout__brand">
          <p className="main-layout__title">Checkitout</p>
          <p className="main-layout__subtitle">3Line Store</p>
        </div>
      </header>

      <div className="main-layout__body">
        <aside className="main-layout__sidebar" aria-label="Primary">
          <nav className="main-layout__nav">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive ? 'main-layout__nav-link main-layout__nav-link--active' : 'main-layout__nav-link'
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="main-layout__content">
          <Outlet />
        </main>
      </div>

      <nav className="main-layout__bottom" aria-label="Primary">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              isActive
                ? 'main-layout__bottom-link main-layout__bottom-link--active'
                : 'main-layout__bottom-link'
            }
          >
            {item.icon}
            <AppTypography variant="caption">{item.short}</AppTypography>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
