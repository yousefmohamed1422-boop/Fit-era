import Icon from '../Components/Icon';
import { Logo } from '../Components/ui';
import { Link, navigate } from '../lib/router';
import { useAdminAuth } from '../lib/auth';

const NAV = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'products', label: 'Products', icon: 'shape' },
  { id: 'categories', label: 'Categories', icon: 'tag' },
  { id: 'bundles', label: 'Bundles', icon: 'layers' },
  { id: 'orders', label: 'Orders', icon: 'truck' },
  { id: 'discounts', label: 'Discount codes', icon: 'tag' },
  { id: 'settings', label: 'Settings', icon: 'gear' },
];

export default function AdminLayout({ route, children }) {
  const { email, logout } = useAdminAuth();
  const go = (id) => navigate(id === 'overview' ? '/admin' : `/admin/${id}`);
  const current = NAV.find((n) => n.id === route.sub) || NAV[0];

  return (
    <div className="min-h-screen flex bg-bg text-fg">
      {/* sidebar (desktop) */}
      <aside className="w-64 shrink-0 border-r border-line p-5 hidden md:flex flex-col">
        <Link to="/admin" className="flex items-center gap-2.5 mb-8 px-1">
          <Logo className="h-8" />
          <span className="font-display text-sm tracking-wide">Dashboard</span>
        </Link>
        <nav className="space-y-1 flex-1">
          {NAV.map((n) => (
            <button
              key={n.id} onClick={() => go(n.id)}
              className={`w-full flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors duration-300 ${route.sub === n.id ? 'bg-fg text-bg' : 'hover:bg-fg/8'}`}
            >
              <Icon name={n.icon} size={17} /> {n.label}
            </button>
          ))}
        </nav>
        <Link to="/" className="flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm border border-line hover:bg-fg/8 transition-colors">
          <Icon name="eye" size={15} /> View site
        </Link>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="h-16 border-b border-line flex items-center justify-between px-4 sm:px-8 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Link to="/" className="icon-btn border border-line md:hidden shrink-0" aria-label="View site"><Icon name="eye" size={16} /></Link>
            <p className="font-display text-lg truncate">{current.label}</p>
          </div>
          <div className="flex items-center gap-3 text-sm shrink-0">
            <span className="text-muted hidden sm:inline truncate max-w-[12rem]">{email}</span>
            <button onClick={logout} className="icon-btn border border-line" aria-label="Log out" title="Log out"><Icon name="logout" size={16} /></button>
          </div>
        </header>

        {/* nav (mobile) */}
        <div className="md:hidden overflow-x-auto no-scrollbar border-b border-line px-3 py-2.5 flex gap-2">
          {NAV.map((n) => (
            <button key={n.id} onClick={() => go(n.id)} className={`chip whitespace-nowrap !py-2 ${route.sub === n.id ? 'on' : ''}`}>{n.label}</button>
          ))}
        </div>

        <main className="p-4 sm:p-8 page-enter">{children}</main>
      </div>
    </div>
  );
}
