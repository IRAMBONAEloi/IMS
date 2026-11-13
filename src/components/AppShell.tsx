import { useState, type ReactNode } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity, ArrowLeftRight, BarChart3, Boxes, ChevronDown, LayoutDashboard,
  LogOut, Menu, Package, Tags, Truck, Users, X,
} from 'lucide-react';
import { useAuth } from '../services/auth-context-value';

const navigation = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Products', path: '/products', icon: Package },
  { label: 'Stock activity', path: '/stock-movements', icon: ArrowLeftRight },
  { label: 'Categories', path: '/categories', icon: Tags, adminOnly: true },
  { label: 'Suppliers', path: '/suppliers', icon: Truck, adminOnly: true },
  { label: 'Reports', path: '/reports', icon: BarChart3, adminOnly: true },
  { label: 'Team', path: '/users', icon: Users, adminOnly: true },
];

interface AppShellProps {
  title: string;
  description: string;
  children: ReactNode;
  actions?: ReactNode;
}

export default function AppShell({ title, description, children, actions }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, setUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const items = navigation.filter((item) => !item.adminOnly || user?.role === 'ADMIN');
  const shopName = user?.shopName || 'Your workspace';

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
    } finally {
      setUser(null);
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="ims-shell">
      {mobileOpen && <button className="ims-backdrop" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
      <aside className={`ims-sidebar ${mobileOpen ? 'is-open' : ''}`} aria-label="Main navigation">
        <NavLink to="/dashboard" className="ims-brand" onClick={() => setMobileOpen(false)}>
          <span className="ims-brand-mark"><Boxes size={22} strokeWidth={2.2} /></span>
          <span className="ims-brand-copy"><strong>IMS</strong><small>STOCK CONTROL</small></span>
        </NavLink>

        <div className="ims-workspace-chip">
          <span className="ims-workspace-icon"><Activity size={15} /></span>
          <span><small>WORKSPACE</small><strong title={shopName}>{shopName}</strong></span>
          <ChevronDown size={14} aria-hidden="true" />
        </div>

        <nav className="ims-nav" aria-label="Inventory sections">
          <p className="ims-nav-label">MANAGE</p>
          {items.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/dashboard'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) => `ims-nav-link ${isActive || (path === '/dashboard' && location.pathname === '/staff-dashboard') ? 'is-active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="ims-sidebar-bottom">
          <div className="ims-plan-card">
            <span className="ims-plan-dot" />
            <span><small>BUILT FOR</small><strong>Better stock days</strong></span>
          </div>
          <div className="ims-account">
            <span className="ims-avatar">{user?.name?.slice(0, 1).toUpperCase() || 'U'}</span>
            <span className="ims-account-copy"><strong>{user?.name || 'Account'}</strong><small>{user?.role === 'ADMIN' ? 'Workspace owner' : 'Team member'}</small></span>
            <button className="ims-icon-button" onClick={logout} aria-label="Sign out" title="Sign out"><LogOut size={16} /></button>
          </div>
        </div>
      </aside>

      <main className="ims-main" id="main-content">
        <header className="ims-topbar">
          <button className="ims-mobile-menu" aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="ims-topbar-context"><span>WORKSPACE</span><strong>{shopName}</strong></div>
          <div className="ims-topbar-right">
            <span className="ims-live-indicator"><span /> Inventory workspace</span>
            <span className="ims-topbar-avatar" aria-label={user?.name}>{user?.name?.slice(0, 1).toUpperCase() || 'U'}</span>
          </div>
        </header>

        <div className="ims-content">
          <div className="ims-page-heading">
            <div>
              <p className="ims-eyebrow">{shopName} <span>/</span> INVENTORY</p>
              <h1>{title}</h1>
              <p className="ims-page-description">{description}</p>
            </div>
            {actions && <div className="ims-page-actions">{actions}</div>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
